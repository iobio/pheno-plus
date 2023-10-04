import './assets/base.css'
import Encounter from '@/models/Encounter';
import fetchNotes from './fetchNotes.js';

import { createApp } from 'vue'
import App from './App.vue'

getClient().then(client => {
    if (client === null) {
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
        const patientId = client.patient.id;

        // Notes Logic
        var notesList = [];
        var notesNum = 0;
        var justSearchData = null;

        let notesObj = await fetchNotes(client, patientId);

        notesList = notesObj.notesList;
        notesNum = notesObj.notesNum;

        const app = createApp(App);
        app.config.globalProperties.$notesListGlobal = notesList;
        app.config.globalProperties.$notesNumGlobal = notesNum;
        app.mount('#app');
    } catch (error) {
        const app = createApp(App)
        app.config.globalProperties.$notesListGlobal = [];
        app.config.globalProperties.$notesNumGlobal = 707;
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