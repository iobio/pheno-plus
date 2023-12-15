import './assets/base.css';
import fetchNotes from './data/fetchNotes.js';

import { createApp } from 'vue'
import App from './App.vue'

//get the url parameters and get the userId
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

//whitelist of userIds that are allowed to access the app
const userIdWhitelist = {
    "u1069837": "emerson lebleu",
    "u0029928": "Tristani",
    "u0969254": "Sabrina"
};

//if we are on local host then skip all of this and mount the app
if (window.location.hostname === "localhost") {
    //If there is an error, create the app with an empty notes list
    const app = createApp(App)
    //Set the notes list as a global property just to empty
    app.config.globalProperties.$notesListGlobal = [];
    app.config.globalProperties.$isTestingEnvironment = true;
    //Mount the app
    app.mount('#app');

// //If the userId is not one on our whitelist then they are not authorized
// } else if ( !(userId in userIdWhitelist) ) {
//     //Do nothing dont mount the app
//     //send a message to the user that they are not authorized
} else {
    getClient().then(client => {
        //If the client is null, we need to authorize
        if (client === null) {
            FHIR.oauth2.authorize({
                //Our application's ID
                client_id: "48f100f1-2599-444b-85f8-5d86b4415453",
                //Initial scope
                scope: "launch patient/*.* openid user/*.* profile",
                //Our redirect URL
                redirect_uri: "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect",
            });
        } else {
            //Call the initializeApp function with the client if it exists
            initializeApp(client);
        }
    });
}

async function initializeApp(fhirClient) {
    try {
        //Get the client
        const client = fhirClient;
        //Get the patient ID
        const patientId = client.patient.id;
        //Initialize the notes list
        var notesList = [];
        var rawResponse = null;
        //Get the notes from the EMR
        let notesObj = await fetchNotes(client, patientId);
        //Set the notes list to the notes pulled from the EMR
        notesList = notesObj.notesList;
        //Set the raw response to the raw response from the EMR
        rawResponse = notesObj.rawResponse;
        //Create the app
        const app = createApp(App);
        //Set the notes list as a global property
        app.config.globalProperties.$notesListGlobal = notesList;
        //Mount the app
        app.mount('#app');
    } catch (error) {
        //If there is an error, create the app with an empty notes list
        const app = createApp(App)
        //Set the notes list as a global property just to empty
        app.config.globalProperties.$notesListGlobal = [];
        //Mount the app
        app.mount('#app');
    }
}

async function getClient() {
    try {
        //Try to get the client
        const client = await FHIR.oauth2.ready();
        //Return it if it works
        return client;
    } catch (error) {
        //If there is an error, return null
        return null;
    }
}