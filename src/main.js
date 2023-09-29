import './assets/base.css'

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
        scope: "launch openid fhirUser patient/*.read",
    
        // Typically, if your redirectUri points to the root of the current directory
        // (where the launchUri is), you can omit this option because the default value is
        // ".". However, some servers do not support directory indexes so "." and "./"
        // will not automatically map to the "index.html" file in that directory.
        redirect_uri: "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect",
        });
} else {
    createApp(App).mount('#app')
}