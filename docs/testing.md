# Testing Pheno+ (Vitest walkthrough)

This project uses [Vitest](https://vitest.dev/) — a test runner built for Vite projects. Tests run in Node (no browser, no Epic) and are suitable for **CI** (`npm test` on every push).

## Run tests locally

```bash
npm install
npm test
```

During development, re-run on file save:

```bash
npm run test:watch
```

## What a unit test looks like

Open `tests/documentReferenceSearch.test.js`. Each file uses:

1. **`describe`** — groups related cases (e.g. one function).
2. **`it`** — one behavior you expect (“builds core clinical-note search…”).
3. **`expect(...).toBe(...)`** — assertion; the test fails if reality ≠ expectation.

```javascript
const url = buildDocumentSearchUrl('patient-123', LOINC_CODES_CORE, { category: 'clinical-note' });
expect(url).toContain('category=clinical-note');
```

No Epic, no `fhirclient`, no Vue — just inputs and outputs. That is the fastest regression net.

## The four example tests (in order of complexity)

| File | What it teaches |
|------|-----------------|
| `tests/documentReferenceSearch.test.js` | Pure FHIR **search URL** building |
| `tests/progressNoteFilter.test.js` | **Fixtures** (`fixtures/fhir/*.json`) + progress vs telephone filter |
| `tests/whiteListAccess.test.js` | Non-FHIR **config** logic |
| `tests/fetchNotes.integration.test.js` | **Mock `client.request`** — same hook as after SMART OAuth |

Production code for (1) and (2) lives under `src/data/fhir/` so it stays small and importable. `fetchNotes.js` orchestrates those pieces plus Binary fetch and `ClinicalNote` construction.

## Mock FHIR client (integration pattern)

After SMART login, the app calls `fetchNotes($client, $patientId)`. In tests we pass a stub:

```javascript
const client = createMockFhirClient({
  handlers: {
    '/DocumentReference?patient=test-patient&...': () => bundleWithEntries([...]),
    'Binary': () => '<p>note html</p>',
  },
});
await fetchNotes(client, 'test-patient');
```

See `tests/helpers/mockFhirClient.js`. Add JSON under `fixtures/fhir/` as Epic-shaped examples grow.

## What stays manual (Epic staging)

- SMART launch, redirect URI, OAuth
- Real Epic `DocumentReference` / Binary behavior

Use staging as a short smoke checklist before release; use `npm test` for day-to-day regressions.

## CI (GitHub Actions example)

Add `.github/workflows/test.yml`:

```yaml
name: test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npm test
```

`npm ci` installs exactly what `package-lock.json` pins (including `vitest`).

## Adding your next test

1. If logic is pure → move or export to `src/data/fhir/` or `src/config/`.
2. Add `tests/yourFeature.test.js` with `describe` / `it` / `expect`.
3. Run `npm test` until green.
4. For FHIR pipelines → extend fixtures + mock handlers.
