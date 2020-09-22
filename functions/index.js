const functions = require("firebase-functions");
const firebase = require("firebase-admin")
const sgMail = require("@sendgrid/mail");
firebase.initializeApp()
const moment = require('moment')
const corsModule = require("cors");
const cors = corsModule({ origin: true })
const Places = require("google-places-web").default;

const SG_API_KEY = functions.config().sendgrid.key;
const SG_TEMPLATE_ID = functions.config().sendgrid.template;
const PLACES_API_KEY = functions.config().places.key;
sgMail.setApiKey(SG_API_KEY);

exports.emailMessage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email, departure_airport, destination_airport } = req.body;
    const error = await sendEmail(email, departure_airport, destination_airport);
    return error ? res.status(500).send(error) : res.sendStatus(200)
  })
});

exports.sendgridEventWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const eventArray = req.body

    let departure_airport, destination_airport;

    let opens = 0;
    let clicks = 0;

    if (eventArray instanceof Array) {
      const sendDetails = await firebase.firestore().collection("sentMail").doc(eventArray[0].email).get()
      if (sendDetails.exists) {
        departure_airport = sendDetails.data().departure_airport || "",
          destination_airport = sendDetails.data().destination_airport || ""
      }


      eventArray.forEach(async eventObj => {
        const userDoc = firebase.firestore().collection("recipients").doc(eventObj.email)

        let eventEntry = eventObj

        eventObj.departure_airport = departure_airport || ""
        eventObj.destination_airport = destination_airport || ""

        await userDoc.set({
          status: firebase.firestore.FieldValue.arrayUnion(eventEntry)
        }, { merge: true }).catch(err => {
          functions.logger.error(err)
        })
        switch (eventEntry.event) {
          case "dropped":
          case "deferred":
          case "bounce":
          case "blocked":
            functions.logger.error("REJECTED EMAIL")
            addToResendQueue(eventEntry)
            break;
          case "click":
            clicks++
            break;
          case "open":
            opens++
            break;
          case "delivered":
            dequeueResend(eventEntry)
            break
          default:
            break;
        }
        functions.logger.log(req.body)
      })
    }
    if (opens > 0 || clicks > 0) {
      const incrementOpens = firebase.firestore.FieldValue.increment(opens);
      const incrementClicks = firebase.firestore.FieldValue.increment(clicks);
      userDoc.update({
        opens: incrementOpens,
        clicks: incrementClicks
      })
    }
  } catch (err) {
    functions.logger.error(err)
    return res.status(500).send(err)
  }
  return res.status(200).send(req.body)
})

exports.resendQueueCollector = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
  const resendItems = await firebase.firestore().collection("resend_queue").where('next_attempt', '<', firebase.firestore.Timestamp.fromDate(new Date())).get()

  functions.logger.log(new Date(), resendItems.docs)
  try {

    resendItems.forEach(doc => {
      sendEmail(doc.id, doc.data().departure_airport || "", doc.data().destination_airport || "")
    })
  } catch (err) {
    functions.logger.error(err);
  }
})


async function addToResendQueue(event) {
  const doc = await firebase.firestore().collection("resend_queue").doc(event.email).get()

  if (doc.exists) {
    const previousTry = moment(doc.data().previous_try)
    const howLongAgo = moment().diff(previousTry) / 1000;
    const nextAttempt = moment(doc.data().next_attempt)
    const difference = nextAttempt.diff(previousTry) / 1000;
    const WAIT_INTERVALS = [2, 3, 5, 10, 20, 100]
    const previousIntervalIndex = WAIT_INTERVALS.indexOf(difference);
    functions.logger.error(previousTry, difference, nextAttempt)
    if (howLongAgo > 105) {
      doc.ref.delete();
    }
    if (previousIntervalIndex < 5) {
      // timestamp in seconds instead of miliseconds
      const previousMoment = moment(event.timestamp * 1000) || moment()
      const nextAttemptMoment = previousMoment.add(WAIT_INTERVALS[previousIntervalIndex + 1], 'minutes')
      doc.ref.set({
        departure_airport: event.departure_airport || "",
        destination_airport: event.destination_airport || "",
        previous_try: firebase.firestore.Timestamp.fromMillis(previousMoment.valueOf()),
        next_attempt: firebase.firestore.Timestamp.fromMillis(nextAttemptMoment.valueOf())
      })
    }
  }
  else {
    // timestamp in seconds instead of miliseconds
    const previousMoment = moment(event.timestamp * 1000) || moment()
    const nextAttemptMoment = previousMoment.add(1, 'minute')
    doc.ref.set({
      departure_airport: event.departure_airport || "",
      destination_airport: event.destination_airport || "",
      previous_try: firebase.firestore.Timestamp.fromMillis(previousMoment.valueOf()),
      next_attempt: firebase.firestore.Timestamp.fromMillis(nextAttemptMoment.valueOf())
    })
  }
}

async function dequeueResend(event) {
  const doc = await firebase.firestore().collection("resend_queue").doc(event.email).get()

  if (doc.exists) {
    doc.ref.delete();
  }
}
async function sendEmail(email, departure_airport, destination_airport) {

  try {
    const results = await getRentals(destination_airport)
functions.logger.error(results)
    carRental = results[0]
    let lat = ""
    let lng =""
    if (carRental.geometry && carRental.geometry.location) {
      lat = carRental.geometry.location.lat
      lng = carRental.geometry.location.lng
    }
    const msg = {
      to: email,
      from: "evbambly@gmail.com",
      templateId: SG_TEMPLATE_ID,
      dynamic_template_data: {
        departure_airport: departure_airport || undefined,
        destination_airport: destination_airport || undefined,
        rental_name: carRental.name || "",
        vicinity: carRental.vicinity || "",
        rating: carRental.rating || "",
        open_now: carRental.opening_hours && carRental.opening_hours.open_now ? "They are open now" : "",
        lat: lat,
        lng: lng,
      },
    };
    sgMail.send(msg);
    firebase.firestore().collection("sentMail").doc(email).set({
      departure_airport: departure_airport || "",
      destination_airport: destination_airport || ""
    }).catch(err => {
      functions.logger.error(err)
    })
    return null
  } catch (err) {
    return err
  }
}

async function getRentals(destination_airport) {
  Places.apiKey = PLACES_API_KEY

  const airport = await Places.textsearch({
    query: `${destination_airport} airport`
  });

  const location = airport.results[0].geometry.location;

  const response = await Places.nearbysearch({
    location: `${location.lat},${location.lng}`, // LatLon delimited by ,
    radius: "500",  // Radius cannot be used if rankBy set to DISTANCE
    type: "car_rental", // Undefined type will return all types
  });

  return response.results;
}