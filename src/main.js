import './assets/base.css';
import fetchNotes from './data/fetchNotes.js';

import { createApp } from 'vue'
import App from './App.vue'

//whitelist of userIds that are allowed to access the app
const userIdWhitelist = {
    "U1069837": "Emerson Lebleu",
    "U0029928": "Martin Tristani-Firouzi",
    "U0969254": "Sabrina", 
    "U0770443": "Kensaku Kawamoto", 
    "U0770371": "Phillip Warner"
};

//if the url is the /launch then get the user off the params otherwise it won't be there anyway
if (window.location.pathname === "/phenoplus/oauth2/launch/") {
    //clear out local storage in case there is anything there
    localStorage.clear();
    sessionStorage.clear();

    //get the url parameters and get the userId
    let urlParams = new URLSearchParams(window.location.search);
    let user = urlParams.get('userId');
    //cache the userId in local storage
    localStorage.setItem('userId', user);
}

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
                completeInTarget: true,
            });
        } else {
            //get the userId from the local storage
            let userId = null;
            try {
                userId = localStorage.getItem('userId');
            } catch (error) {
                //just make userid null so we can handle it below
                userId = null;
            }
            if (!userId || !(userId in userIdWhitelist)) {
                //If there is an error, create the app with an empty notes list
                const app = createApp(App)
                //Set the notes list as a global property just to empty
                app.config.globalProperties.$notesListGlobal = [];
                app.config.globalProperties.$userNotAuthorized = true;
                //Mount the app
                app.mount('#app');
            } else {
                //Call the initializeApp function with the client if it exists
                initializeApp(client);
            }
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
        app.config.globalProperties.$userNotAuthorized = false;
        //Mount the app
        app.mount('#app');
    } catch (error) {
        //If there is an error, create the app with an empty notes list
        const app = createApp(App)
        //Set the notes list as a global property just to empty
        app.config.globalProperties.$notesListGlobal = [];
        app.config.globalProperties.$userNotAuthorized = false;
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