import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = path.join(rootDir, 'config', 'templates');
const publicDir = path.join(rootDir, 'public');

const CONFIG_FILES = [
    ['deploymentConfig.example.json', 'deploymentConfig.json'],
    ['whiteList.example.json', 'whiteList.json'],
];

let created = 0;

for (const [exampleName, targetName] of CONFIG_FILES) {
    const examplePath = path.join(templatesDir, exampleName);
    const targetPath = path.join(publicDir, targetName);

    if (!fs.existsSync(examplePath)) {
        console.warn(`Missing template: config/templates/${exampleName}`);
        continue;
    }

    if (fs.existsSync(targetPath)) {
        continue;
    }

    fs.copyFileSync(examplePath, targetPath);
    console.log(`Created public/${targetName} from config/templates/${exampleName}`);
    created += 1;
}

if (created === 0) {
    console.log('Config files already present (deploymentConfig.json, whiteList.json).');
} else {
    console.log('Edit public/deploymentConfig.json: fill environments.staging and environments.production.');
}
