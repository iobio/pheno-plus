import './assets/base.css';
import fetchNotes from './data/fetchNotes.js';

import { createApp } from 'vue'
import App from './App.vue'

//if we are on local host then skip all of this and mount the app
if (window.location.hostname === "localhost") {
    //If there is an error, create the app with an empty notes list
    const app = createApp(App)
    //Set the notes list as a global property just to empty
    app.config.globalProperties.$notesListGlobal = [];
    app.config.globalProperties.$isTestingEnvironment = true;
    //Mount the app
    app.mount('#app');
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
        //Get the notes from the EMR
        let notesObj = await fetchNotes(client, patientId);
        //Set the notes list to the notes pulled from the EMR
        notesList = notesObj.notesList;
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