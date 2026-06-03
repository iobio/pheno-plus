import './assets/base.css';
import { createApp } from 'vue'
import App from './App.vue'
import { loadWhiteList, userHasAccess } from './config/whiteListAccess.js';
import {
    cacheLaunchUserId,
    getOAuthSettings,
    hasOAuthSettings,
    loadDeploymentConfig,
} from './config/deployment.js';

const SMART_SCOPE = 'launch patient/*.* openid user/*.* profile';

(async function () {
    const deploymentConfig = await loadDeploymentConfig();

    if (deploymentConfig.bypassFHIR === true) {
        mountLocalApp(deploymentConfig);
        return;
    }

    cacheLaunchUserId();

    if (!hasOAuthSettings(deploymentConfig)) {
        console.error(
            'deploymentConfig.json: set clientId and redirectUri for this host under environments.*',
        );
        return;
    }

    const oauth = getOAuthSettings(deploymentConfig);

    getClient()
        .then(async (client) => {
            if (client === null) {
                try {
                    await FHIR.oauth2.authorize({
                        client_id: oauth.clientId,
                        scope: SMART_SCOPE,
                        redirect_uri: oauth.redirectUri,
                        completeInTarget: true,
                    });
                } catch (error) {
                    console.error('Error authorizing, there was an error following the authorization flow.');
                }
                return;
            }

            let userId = null;
            try {
                userId = localStorage.getItem('userId');
            } catch (error) {
                // userId stays null
            }

            const whiteList = await loadWhiteList();

            if (!userHasAccess(userId, whiteList, deploymentConfig)) {
                mountNoAccessApp();
                return;
            }

            mountApp(client, deploymentConfig);
        })
        .catch(() => {
            console.error('Error getting client');
        });
})();

function mountLocalApp(deploymentConfig) {
    const app = createApp(App);
    app.config.globalProperties.$userHasAccess = true;
    app.config.globalProperties.$deploymentConfig = deploymentConfig;
    app.mount('#app');
}

function mountNoAccessApp() {
    const app = createApp(App);
    app.config.globalProperties.$userHasAccess = false;
    app.mount('#app');
}

function mountApp(fhirClient, deploymentConfig) {
    const app = createApp(App);
    app.config.globalProperties.$userHasAccess = true;
    app.config.globalProperties.$client = fhirClient;
    app.config.globalProperties.$patientId = fhirClient.patient.id;
    app.config.globalProperties.$deploymentConfig = deploymentConfig;
    app.mount('#app');
}

async function getClient() {
    try {
        return await FHIR.oauth2.ready();
    } catch (error) {
        return null;
    }
}
