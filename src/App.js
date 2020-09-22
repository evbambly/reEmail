import React, { useState } from 'react'
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlaneArrival, faPlaneDeparture, faAt } from '@fortawesome/free-solid-svg-icons'
import IDForm from './id-form'
import DataTable from './data-table'

library.add(faPlaneArrival, faPlaneDeparture, faAt)

function App() {

  const [emailID, setEmailID] = useState("");


  return (
    <div className="App">
      <header className="App-header">
        {emailID && emailID.length > 1 ?
          <DataTable emailAddress={emailID} back={() => { setEmailID("") }} />
          :
          <IDForm setEmailAddress={(email) => { setEmailID(email) }} />

        }
        <div style={{ marginTop: "5%", color: "#64dcfc", display: "inline-flex" }}>
          <a href="https://github.com/evbambly/reEmail" title="The Github Repository" style={{ float: "left", marginRight: "15%" }}>
            <img
              src={window.location.origin + "/Git.jpg"}
              alt="ReEmail Logo"
              style={{ height: "3rem" }}
            /> </a>
          <div style={{ color: "#64dcfc", float: "right" }}>
            <span>Powered by &nbsp;</span>
        <a href="https://retravel.io/">
              <img
                src={window.location.origin + "/reEmailLogoPeach.jpg"}
                alt="ReEmail Logo"
                style={{ height: "1.5rem" }}
              />
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
