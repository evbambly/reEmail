import React, { useState } from 'react';
import { MenuItem, InputAdornment, Button } from '@material-ui/core'
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { yellow } from '@material-ui/core/colors'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlaneArrival, faPlaneDeparture, faAt } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import * as firebase from "firebase/app";
import "firebase/firestore";

function IDForm({ setEmailAddress }) {
    const [origin, setOrigin] = useState("")
    const [destination, setDestination] = useState("")
    const [email, setEmail] = useState("")
    const [existingEmail, setExistingEmail] = useState("")

    const airports = [
        {
            value: 'Ben Gurion',
            label: 'Tel Aviv (LLBG)',
        },
        {
            value: 'Charles de Gaulle',
            label: 'Paris (CDG)',
        },
        {
            value: 'Heathrow',
            label: 'London (LHR)',
        },
        {
            value: 'Frankfurt',
            label: 'Frankfurt (FRA)',
        },
    ];

    const useStyles = makeStyles({
        root: {
            color: "#fc6d64",
        },
        underline: {
            color: "#fc6d64",
            borderBottom: "#fc6d64",

        },
    });

    const theme = createMuiTheme({
        palette: {
            error: {
                main: yellow[300]
            },
        },

    });
    const classes = useStyles();


    const sendEmail = () => {
        axios.post("https://us-central1-re-email-excersize.cloudfunctions.net/emailMessage",
            {
                "departure_airport": origin,
                "destination_airport": destination,
                "email": email,
            })
        setEmailAddress(email)
    }
    const handleAirportChange = (type, value) => {
        if (type === "origin") {
            setOrigin(value)
        }
        if (type === "destination") {
            setDestination(value)
        }
    }
    const doesEmailExist = async () => {
        const collection = firebase.firestore().collection("recipients")
        const doc = await collection.doc(existingEmail).get();
        if (doc.exists) {
            setEmailAddress(existingEmail)
        } else {
            setExistingEmail("")
        }
    }
    return (
        <>
            <ThemeProvider theme={theme} >
                <ValidatorForm
                    onSubmit={sendEmail}
                    onError={errors => console.log(errors)}
                    style={{ display: "inline-block", backgroundColor: "#fc6d64", padding: "30px", marginBottom: "2%", marginTop: "5%" }}
                >
                    <TextValidator
                        select
                        label="Origin Airport"
                        value={origin}
                        onChange={(event) => handleAirportChange("origin", event.target.value)}
                        helperText="Please select origin airport"
                        style={{ margin: "10px" }}
                        validators={['required']}
                        errorMessages={['this field is required']}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faPlaneDeparture} color="grey" />
                                </InputAdornment>
                            ),
                        }}
                    >
                        {airports.map(option =>
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>)
                        }
                    </TextValidator>

                    <TextValidator
                        select
                        label="Destination Airport"
                        value={destination}
                        onChange={(event) => handleAirportChange("destination", event.target.value)}
                        helperText="Please select destination airport"
                        style={{ margin: "10px" }}
                        validators={['required']}
                        errorMessages={['this field is required']}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faPlaneArrival} color="grey" />
                                </InputAdornment>
                            ),
                        }}
                    >
                        {airports.map(option =>
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>)
                        }
                    </TextValidator>
                    <TextValidator
                        label="Email"
                        onChange={(event) => setEmail(event.target.value)}
                        value={email}
                        validators={['required', 'isEmail']}
                        errorMessages={['this field is required', 'email is not valid']}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faAt} color="grey" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button type="submit" variant="contained" color="primary" style={{ marginTop: "3%" }}>Send</Button>
                </ValidatorForm>

                <ValidatorForm
                    onSubmit={doesEmailExist}
                    onError={errors => console.log(errors)}
                >
                    <TextValidator
                        label="Existing Email"
                        validators={['required']}
                        errorMessages={['this field is required']}
                        InputLabelProps={{
                            className: classes.root
                        }}
                        InputProps={{
                            classes: { underline: classes.underline }
                        }}
                        value={existingEmail}
                        onChange={(event) => setExistingEmail(event.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" style={{ marginTop: "3%" }}>Send</Button>
                </ValidatorForm>
            </ThemeProvider>

        </>
    );
}

export default IDForm;
