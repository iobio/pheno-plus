import './assets/base.css'
import Encounter from '@/models/Encounter';

import { createApp } from 'vue'
import App from './App.vue'


if (window.location.pathname === "/phenoplus/oauth2/launch" ) {
    FHIR.oauth2.authorize({
        // The client_id that you should have obtained after registering a client at
        // the EHR.
        client_id: "48f100f1-2599-444b-85f8-5d86b4415453",
    
        // The scopes that you request from the EHR. In this case we want to:
        // launch            - Get the launch context
        // openid & fhirUser - Get the current user
        // patient/*.read    - Read patient data
        // scope: "launch openid fhirUser patient/*.read", //this was the fhir default
        scope: "launch patient/*.* openid user/*.* profile",
    
        // Typically, if your redirectUri points to the root of the current directory
        // (where the launchUri is), you can omit this option because the default value is
        // ".". However, some servers do not support directory indexes so "." and "./"
        // will not automatically map to the "index.html" file in that directory.
        redirect_uri: "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect",
        // redirect_uri: "http://localhost:3002/phenoplus/oauth2/redirect/",
        });
} else {
    FHIR.oauth2.ready()
        .then((client) => {
            // Get encounters for the selected patient
            client.request("/Encounter?patient=" + client.patient.id)
            .then(function(data) {
                if (!data.entry || !data.entry.length) {
                    throw new Error("No encounters found for the selected patient");
                }
                return data.entry;
            })
            .then((encounters) => {
                    var encountersNum = encounters.length;
                    var encountersList = [];

                    for (let encounter of encounters) {
                        var id = encounter.resource.id;
                        var encType = null;
                        var reason = null;
                        var start = null;
                        var end = null;

                        //Make sure the encounter has the required fields if not note that
                        if (encounter.resource.type && encounter.resource.type[0] && encounter.resource.type[0].text) {
                            encType = encounter.resource.type[0].text;
                        } else {
                            encType = "No type found.";
                        }

                        if (encounter.resource.reasonCode && encounter.resource.reasonCode[0].coding[0].display) {
                            reason = encounter.resource.reasonCode[0].coding[0].display;
                        } else {
                            reason = "No reason found.";
                        }

                        if (encounter.resource.period.start) {
                            start = encounter.resource.period.start;
                        } else {
                            start = "No start date found.";
                        }

                        if (encounter.resource.period.end) {
                            end = encounter.resource.period.end;
                        } else {
                            end = "No end date found.";
                        }

                        //Create the encounter object
                        var encounterObj = new Encounter(id, encType, reason, start, end);
                        //Add the encounter to the list of encounters
                        encountersList.push(encounterObj);
                    };
                    return [encountersNum, encountersList];
                },
                (error) => {
                    console.log(error.stack);
            })
            .then(function(encountersPair) {
                const app = createApp(App);

                app.config.globalProperties.$encounterList = encountersPair[1];
                app.config.globalProperties.$encounterNum = encountersPair[0];
                
                app.mount('#app')
            }, 
            (error) => {
                console.log(error.stack);
            });
        }).catch(console.error);

        // createApp(App).mount('#app')
}