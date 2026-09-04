// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { _pullTextContent } from '@/data/fetchNotes.js';

describe('_pullTextContent block boundaries', () => {
    it('separates h2 headings from following paragraphs in flattened text', () => {
        const html =
            '<h2>Impression</h2><p>The constellation of coloboma meets clinical criteria for CHARGE syndrome.</p>';
        const { allText } = _pullTextContent(html);

        expect(allText).toMatch(/impression\.?\s*\n\n\s*the constellation/i);
        expect(allText).not.toMatch(/impression the constellation/i);
    });

    it('keeps inline elements within a block on one line', () => {
        const html = '<p>Exam notable for <b>persistent hypotonia</b> with head lag.</p>';
        const { allText } = _pullTextContent(html);

        expect(allText.toLowerCase()).toContain('exam notable for persistent hypotonia with head lag');
    });

    it('ends numbered list paragraphs with a period and block break', () => {
        const html =
            '<p>4. Bilateral choanal atresia, stented</p><p>5. Bilateral sensorineural hearing loss</p><p>6. Dysphagia, G-tube dependent</p>';
        const { allText } = _pullTextContent(html);

        expect(allText).toMatch(/choanal atresia, stented\.\s*\n\n\s*5\. bilateral sensorineural hearing loss\./i);
        expect(allText).toMatch(/hearing loss\.\s*\n\n\s*6\. dysphagia, g tube dependent\./i);
        expect(allText.toLowerCase()).not.toMatch(/hearing loss 6/);
    });

    it('wraps a tagless note in a paragraph so text nodes are not body children', () => {
        const { html, textNodeMap, allText } = _pullTextContent(
            'Past medical history included sensorineural hearing loss and dysphagia.',
        );

        expect(html).toMatch(/^<p>/i);
        expect(textNodeMap.length).toBeGreaterThan(0);
        expect(textNodeMap.every((entry) => entry.parentPath && entry.parentPath !== '')).toBe(true);
        expect(allText.toLowerCase()).toContain('sensorineural hearing loss');
    });
});
