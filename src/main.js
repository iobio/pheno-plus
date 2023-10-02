import './assets/base.css'
import Encounter from '@/models/Encounter';

import { createApp } from 'vue'
import App from './App.vue'


const LOCAL_REDIRECT_URL = "http://localhost:3002/phenoplus/oauth2/redirect/";
const STAGING_REDIRECT_URL = "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect";
const STAGING_LAUNCH_URL = "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/launch";

getClient().then(client => {
    if (client === null) {
        const redirectUri = window.location.href === STAGING_LAUNCH_URL ? STAGING_REDIRECT_URL : LOCAL_REDIRECT_URL;

        FHIR.oauth2.authorize({
            client_id: "48f100f1-2599-444b-85f8-5d86b4415453",
            scope: "launch patient/*.* openid user/*.* profile",
            redirect_uri: redirectUri,
        });
    } else {
        initializeApp(client);
    }
});

async function initializeApp(fhirClient) {
    try {
        const client = fhirClient;
        const data = await client.request("/Encounter?patient=" + client.patient.id);

        if (!data.entry || !data.entry.length) {
            throw new Error("No encounters found for the selected patient");
        }

        const encounters = data.entry;
        const encountersNum = encounters.length;
        const encountersList = [];

        for (let encounter of encounters) {
            const { resource } = encounter;
            const id = resource.id;
            const encType = resource.type?.[0]?.text || "No type found.";
            const reason = resource.reasonCode?.[0]?.coding?.[0]?.display || "No reason found.";
            const start = resource.period.start || "No start date found.";
            const end = resource.period.end || "No end date found.";

            const encounterObj = new Encounter(id, encType, reason, start, end);
            encountersList.push(encounterObj);
        }

        const app = createApp(App);
        app.config.globalProperties.$encounterListGlobal = encountersList;
        app.config.globalProperties.$encounterNumGlobal = encountersNum;
        app.mount('#app');

    } catch (error) {
        const app = createApp(App)
        app.config.globalProperties.$encounterListGlobal = [];
        app.config.globalProperties.$encounterNumGlobal = 22;

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