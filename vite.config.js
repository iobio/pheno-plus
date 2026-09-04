import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const mockNotesPath = path.join(rootDir, 'fixtures/mock-notes.json');

function serveMockNotesDev() {
    return {
        name: 'serve-mock-notes-dev',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split('?')[0] ?? '';
                if (!url.endsWith('/mock-notes.json')) {
                    next();
                    return;
                }

                if (!fs.existsSync(mockNotesPath)) {
                    res.statusCode = 404;
                    res.end('mock-notes.json not found');
                    return;
                }

                res.setHeader('Content-Type', 'application/json');
                fs.createReadStream(mockNotesPath).pipe(res);
            });
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3002,
    },
    plugins: [vue(), serveMockNotesDev()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    // Default base when not overridden by build:staging | build:production.
    base: '/launch/',
});
