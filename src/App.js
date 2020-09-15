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
          <DataTable emailAddress={emailID} back={()=> {setEmailID("")}} />
          :
          <IDForm setEmailAddress={(email) => { setEmailID(email) }} />

        }
      </header>
      <div style={{ position: "absolute", bottom: "50px", left: "25%", color: "#64dcfc" }}>
        <a href="https://github.com/evbambly/reEmail" title="The Git repository">
          <img
            src={window.location.origin + "/Git.jpg"}
            alt="ReEmail Logo"
            style={{ height: "3rem" }}
          />

        </a>
      </div>
      <div style={{ position: "absolute", bottom: "50px", right: "25%", color: "#64dcfc" }}>
        Powered by &nbsp;
        <a href="https://retravel.io/">
          <img
            src={window.location.origin + "/reEmailLogoPeach.jpg"}
            alt="ReEmail Logo"
            style={{ height: "1.5rem" }}
          />

        </a>
      </div>
    </div>
  );
}

export default App;
