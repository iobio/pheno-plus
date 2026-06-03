import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const dummyNotesPath = path.join(rootDir, 'fixtures/dummyNotes.json');

function serveDummyNotesDev() {
    return {
        name: 'serve-dummy-notes-dev',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split('?')[0] ?? '';
                if (!url.endsWith('/dummyNotes.json')) {
                    next();
                    return;
                }

                if (!fs.existsSync(dummyNotesPath)) {
                    res.statusCode = 404;
                    res.end('dummyNotes.json not found');
                    return;
                }

                res.setHeader('Content-Type', 'application/json');
                fs.createReadStream(dummyNotesPath).pipe(res);
            });
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3002,
    },
    plugins: [vue(), serveDummyNotesDev()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    // Default base when not overridden by build:staging | build:production.
    base: '/launch/',
});
