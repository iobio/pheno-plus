import './assets/base.css';
import { createApp } from 'vue'
import App from './App.vue'

//whitelist of userIds that are allowed to access the app
const userIdWhitelist = {
    "U1069837": "Emerson Lebleu",
    "U0029928": "Martin Tristani-Firouzi",
    "U0969254": "Sabrina", 
    "U0770443": "Kensaku Kawamoto", 
    "U0770371": "Phillip Warner",
    "U0059678": "Dave Tille",
    "U0827583": "Bryce Covey"
};

let prod = false;
let redirect_uri = "";

//if the base url is the production url then set the prod flag to true
if (window.location.hostname === "pheno-plus.iobio.chpc.utah.edu") {
    prod = true;
}

//if the url is the staging launch then get the user off the params 
if (window.location.pathname === "/phenoplus/oauth2/launch/") {
    //clear out local storage in case there is anything there
    localStorage.clear();
    sessionStorage.clear();

    //get the url parameters and get the userId
    let urlParams = new URLSearchParams(window.location.search);
    let user = urlParams.get('userId');

    //cache the userId in local storage
    localStorage.setItem('userId', user);
    redirect_uri = "https://mosaic-staging.chpc.utah.edu/phenoplus/oauth2/redirect";
}

//if the url is the production launch then get the user off the params
if (prod == true && window.location.pathname === "/launch/") {
    //clear out local storage in case there is anything there
    localStorage.clear();
    sessionStorage.clear();

    //get the url parameters and get the userId
    let urlParams = new URLSearchParams(window.location.search);
    let user = urlParams.get('userId');

    //cache the userId in local storage
    localStorage.setItem('userId', user);
    redirect_uri = "https://pheno-plus.iobio.chpc.utah.edu/redirect";
}

//if we are on local host then skip all of this and mount the app with the testing environment flag
if (window.location.hostname === "localhost") {
    const app = createApp(App)
    app.config.globalProperties.$isTestingEnvironment = true;
    app.mount('#app');
} else {
    //Try to get the FHIR client if we can
    getClient().then(async (client) => {
        //If the client is null, we need to try to authorize
        if (client === null) {
            try {
                await FHIR.oauth2.authorize({
                    //Our application's ID
                    client_id: "48f100f1-2599-444b-85f8-5d86b4415453",
                    //Initial scope
                    scope: "launch patient/*.* openid user/*.* profile",
                    //Our redirect URL
                    redirect_uri: redirect_uri,
                    completeInTarget: true,
                });
            } catch (error) {
                //If there is an error, just show a simple error in the console that says "Error authorizing"
                console.error("Error authorizing, there was an error following the authorization flow.");
            }

        //If we have a client, we need to check if the user is authorized to use the app
        } else {
            let userId = null;
            try {
                //Try to get the userId from local storage
                userId = localStorage.getItem('userId');
            } catch (error) {
                //If that fails then do nothing and userId will be null
            }

            if (!userId || !(userId in userIdWhitelist)) {
                //If we can't get the userId or it is not in the whitelist, then we need to set the userNotAuthorized flag and mount the app
                const app = createApp(App)
                app.config.globalProperties.$userNotAuthorized = true;
                app.mount('#app');
            } else {
                //Call the initializeApp function with the client if it exists & the user is authorized to use the app
                initializeApp(client);
            }
        }
    }).catch(error => {
        //Just show a simple error in the console if we cannot get the client that just says "Error getting client"
        console.error("Error getting client");
    });
}

async function initializeApp(fhirClient) {
    //Set the client
    const client = fhirClient;
    //Set the patientId
    const patientId = client.patient.id;


    const app = createApp(App);
    //Set the properties needed for the app
    app.config.globalProperties.$userNotAuthorized = false;
    app.config.globalProperties.$isTestingEnvironment = false;
    
    app.config.globalProperties.$client = client;
    app.config.globalProperties.$patientId = patientId;

    app.mount('#app');
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