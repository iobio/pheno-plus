import './assets/base.css'
import Encounter from '@/models/Encounter';

import { createApp } from 'vue'
import App from './App.vue'


if (window.location.pathname === "/phenoplus/oauth2/launch" ) {
    FHIR.oauth2.authorize({
        client_id: "48f100f1-2599-444b-85f8-5d86b4415453",
        scope: "launch patient/*.* openid user/*.* profile",
        redirect_uri: "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect",

        // redirect_uri: "http://localhost:3002/phenoplus/oauth2/redirect/",
        });
} else {
    initializeApp();
}

async function initializeApp() {
    try {
        const client = await FHIR.oauth2.ready();
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
        app.config.globalProperties.$encounterList = encountersList;
        app.config.globalProperties.$encounterNum = encountersNum;
        app.mount('#app');

    } catch (error) {
        createApp(App).mount('#app');
        console.error(error.stack);
    }
}