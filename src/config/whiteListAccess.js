import { fetchJsonConfig } from './configLoader.js';

/**
 * White list gate after SMART OAuth. Distinct from FHIR.oauth2.authorize().
 * Roster in public/whiteList.json (copy from config/templates/whiteList.example.json via setup:config).
 */
export async function loadWhiteList() {
    return fetchJsonConfig('whiteList.json', 'whiteList');
}

/**
 * When enforceWhiteList is false, any SMART-authenticated user may use the app.
 * When true, the user must appear on the white list.
 */
export function userHasAccess(userId, whiteList, deploymentConfig) {
    if (deploymentConfig.enforceWhiteList !== true) {
        return true;
    }

    if (!userId) {
        return false;
    }

    const roster = whiteList || {};
    return Object.keys(roster).some((key) => key.toLowerCase() === userId.toLowerCase());
}
