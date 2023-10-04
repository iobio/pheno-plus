import './assets/base.css'
import Encounter from '@/models/Encounter';
import fetchNotes from './fetchNotes.js';

import { createApp } from 'vue'
import App from './App.vue'


const LOCAL_REDIRECT_URL = "http://localhost:3002/phenoplus/oauth2/redirect/";
const STAGING_REDIRECT_URL = "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect";
const STAGING_LAUNCH_URL = "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/launch";

getClient().then(client => {
    if (client === null) {
        // Parse the current location and the comparison URLs into URL objects
        const currentLocation = new URL(window.location.href);
        const localUri= new URL(LOCAL_REDIRECT_URL);

        //const redirectUri = LOCAL_REDIRECT_URL;
        const redirectUri = STAGING_REDIRECT_URL;

        FHIR.oauth2.authorize({
            client_id: "48f100f1-2599-444b-85f8-5d86b4415453",
            scope: "launch patient/*.* openid user/*.* profile",
            redirect_uri: "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect",
        });
    } else {
        initializeApp(client);
    }
});

async function initializeApp(fhirClient) {
    try {
        const client = fhirClient;
        var encountersList = [];
        var encountersNum = 0;
        const patientId = client.patient.id;

        const data = await client.request("/Encounter?patient=" + patientId);

        if (!data.entry || !data.entry.length) {
            throw new Error("No encounters found for the selected patient");
        }

        var encounters = data.entry;
        encountersNum = encounters.length;

        for (let encounter of encounters) {
            let { resource } = encounter;
            let id = resource.id;

            let encType = resource.type?.[0]?.text || "No type found.";
            let reason = resource.reasonCode?.[0]?.coding?.[0]?.display || "No reason found.";
            let start = resource.period.start || "No start date found.";
            let end = resource.period.end || "No end date found.";

            let encounterObj = new Encounter(id, encType, reason, start, end);
            encountersList.push(encounterObj);
        }

        // Notes Logic
        var notesList = [];
        var notesNum = 0;
        var justSearchData = null;

        let notesObj = await fetchNotes(client, patientId);

        // notesList = notesObj.notesList;
        // notesNum = notesObj.notesNum;
        // justSearchData = notesObj.justSearchData;

        const app = createApp(App);
        //Encounters
        app.config.globalProperties.$encountersListGlobal = encountersList;
        app.config.globalProperties.$encountersNumGlobal = encountersNum;

        //Notes
        app.config.globalProperties.$notesListGlobal = notesList;
        app.config.globalProperties.$notesNumGlobal = notesNum;

        app.config.globalProperties.$fhirClientGlobal = justSearchData;
        app.mount('#app');

    } catch (error) {
        const app = createApp(App)
        app.config.globalProperties.$encounterListGlobal = [];
        app.config.globalProperties.$encounterNumGlobal = 707;

        app.mount('#app');
        console.error(error.stack);
    }
}

async function getClient() {
    try {
        const client = await FHIR.oauth2.ready();
        return client;
    } catch (error) {
        console.error('Error getting client:', error.message);
        return null;
    }
}