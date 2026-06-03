/**
 * Load JSON config files colocated with the app (same directory as the current page).
 * Works for any deployment base path without hardcoding /launch/ vs /phenoplus/...
 */
export function configUrl(filename) {
    return new URL(filename, window.location.href).href;
}

export async function fetchJsonConfig(filename, label) {
    try {
        const response = await fetch(configUrl(filename));
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error getting ${label}`);
        return {};
    }
}
