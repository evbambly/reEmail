import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as firebase from "firebase/app";
import "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyC6b9DQp_K4IPwAg_r68yp85LJeXQ06V0I",
    authDomain: "re-email-excersize.firebaseapp.com",
    databaseURL: "https://re-email-excersize.firebaseio.com",
    projectId: "re-email-excersize",
    storageBucket: "re-email-excersize.appspot.com",
    messagingSenderId: "676835293280",
    appId: "1:676835293280:web:8e893c44fd7dba21e62b05",
    measurementId: "G-KTXZCJK4QH"
  };

firebase.initializeApp(firebaseConfig)

ReactDOM.render(
    <App />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
