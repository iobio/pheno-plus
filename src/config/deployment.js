import { fetchJsonConfig } from './configLoader.js';

/**
 * Deployment config: one gitignored public/deploymentConfig.json maps hostnames
 * to per-environment settings. Copy config/templates/deploymentConfig.example.json via
 * `npm run setup:config`.
 *
 * bypassFHIR: skip SMART OAuth and load dummy notes (local dev only).
 */
const DEFAULT_DEPLOYMENT_CONFIG = {
    enforceWhiteList: true,
    bypassFHIR: false,
    clientId: '',
    redirectUri: '',
};

export function resolveConfigForHost(registry, hostname) {
    if (!registry?.environments) {
        return registry;
    }

    const envKey = registry.hosts?.[hostname];
    if (!envKey) {
        console.error(`deploymentConfig.json: no host mapping for "${hostname}"`);
        return null;
    }

    const envConfig = registry.environments[envKey];
    if (!envConfig) {
        console.error(`deploymentConfig.json: missing environments.${envKey}`);
        return null;
    }

    return envConfig;
}

export async function loadDeploymentConfig(hostname = window.location.hostname) {
    const registry = await fetchJsonConfig('deploymentConfig.json', 'deploymentConfig');
    const resolved = resolveConfigForHost(registry, hostname);

    if (!resolved) {
        return { ...DEFAULT_DEPLOYMENT_CONFIG };
    }

    return {
        ...DEFAULT_DEPLOYMENT_CONFIG,
        ...resolved,
    };
}

export function getOAuthSettings(deploymentConfig) {
    return {
        clientId: deploymentConfig.clientId || '',
        redirectUri: deploymentConfig.redirectUri || '',
    };
}

export function hasOAuthSettings(deploymentConfig) {
    const oauth = getOAuthSettings(deploymentConfig);
    return Boolean(oauth.clientId && oauth.redirectUri);
}

/**
 * Epic passes userId on launch; cache it for white list checks after OAuth completes.
 */
export function cacheLaunchUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('userId');

    if (!user) {
        return;
    }

    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('userId', user);
}
