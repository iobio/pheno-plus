/**
 * Example 3 — Unit test for app config logic (not FHIR)
 *
 * Same pattern as above; tests code that gates access after SMART login.
 */
import { describe, expect, it } from 'vitest';
import { userHasAccess } from '@/config/whiteListAccess.js';

describe('userHasAccess', () => {
    const roster = { Alice: true, bob: true };

    it('allows any user when enforceWhiteList is false', () => {
        expect(userHasAccess('unknown', roster, { enforceWhiteList: false })).toBe(true);
    });

    it('requires roster match when enforceWhiteList is true (case-insensitive)', () => {
        const config = { enforceWhiteList: true };
        expect(userHasAccess('alice', roster, config)).toBe(true);
        expect(userHasAccess('BOB', roster, config)).toBe(true);
        expect(userHasAccess(null, roster, config)).toBe(false);
        expect(userHasAccess('stranger', roster, config)).toBe(false);
    });
});
