export function buildHighlightedNote(note, hpoItemObj) {
    const htmlMapping = note.getHtmlMapping();
    const rawText = note.getText();

    if (!note.html || !rawText || !htmlMapping || htmlMapping.length === 0) {
        return {
            html: note.html || '',
            snippets: [],
            hasHighlights: false,
        };
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(note.html, 'text/html');
    const contexts = note.getContexts(hpoItemObj.getHpoId()) || [];
    const term = hpoItemObj.getPhenotypeName().toLowerCase();

    let scrollIndex = 0;

    const transformCache = new Map();
    function _transformPath(parentPath) {
        if (transformCache.has(parentPath)) {
            return transformCache.get(parentPath);
        }
        if (!parentPath || !String(parentPath).trim()) {
            transformCache.set(parentPath, 'body');
            return 'body';
        }
        const parts = parentPath.split(' > ');
        const selector = parts
            .map((part) => {
                const [tag, idx] = part.split('[');
                return idx ? `${tag}:nth-child(${parseInt(idx.replace(']', ''), 10) + 1})` : tag;
            })
            .join(' > ');
        const safeSelector = selector.trim() ? selector : 'body';
        transformCache.set(parentPath, safeSelector);
        return safeSelector;
    }

    function _highlightInnerText(textRaw, html, map) {
        const text = textRaw.toLowerCase();
        const textLength = text.length;
        const highlightedHtml = html.cloneNode(true);
        let i = 0;

        function applyHighlight(iMatch, jMatch, iMatchIndex, jMatchIndex) {
            if (!iMatch) {
                return;
            }

            let newScroll = false;
            if (jMatchIndex - iMatchIndex === 0) {
                const elem = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));

                if (!elem) return;

                elem.setAttribute('id', `context-highlight-${scrollIndex}`);
                elem.setAttribute('class', 'highlighted-context');
                newScroll = true;
            } else if (jMatchIndex - iMatchIndex === 1) {
                if (!jMatch) {
                    return;
                }
                if (iMatch.parentPath === jMatch.parentPath) {
                    const elem = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));

                    if (!elem) return;

                    elem.setAttribute('id', `context-highlight-${scrollIndex}`);
                    elem.setAttribute('class', 'highlighted-context');
                } else {
                    const iElement = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));
                    const jElement = highlightedHtml.querySelector(_transformPath(jMatch.parentPath));

                    if (!iElement || !jElement) return;

                    let iText = iElement.innerText;
                    let jText = jElement.innerText;

                    iElement.setAttribute('id', `context-highlight-${scrollIndex}`);
                    iElement.setAttribute('class', 'highlighted-context');
                    iElement.innerText = iText + ' ' + jText;

                    jElement.innerText = '';
                    jElement.setAttribute('class', 'silent');
                }
                newScroll = true;
            } else {
                let combinedText = '';
                let lastPath = '';
                for (let k = iMatchIndex; k <= jMatchIndex; k++) {
                    let el = map[k];
                    if (!el) continue;

                    if (el.parentPath !== lastPath) {
                        let element = highlightedHtml.querySelector(_transformPath(el.parentPath));

                        if (element) combinedText += element.innerText;
                        if (k === iMatchIndex) {
                            element.setAttribute('id', `context-highlight-${scrollIndex}`);
                            element.setAttribute('class', 'highlighted-context');
                        } else if (k !== iMatchIndex) {
                            element.innerText = '';
                            element.setAttribute('class', 'silent');
                        }
                        lastPath = el.parentPath;
                    }
                }

                const firstElem = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));
                if (firstElem) {
                    firstElem.innerText = combinedText;
                    newScroll = true;
                }
            }

            if (newScroll) {
                scrollIndex++;
            }
        }

        let contextList = [];
        for (const context of contexts) {
            contextList.push({
                text: context.toLowerCase(),
                length: context.length,
                threshold: Math.floor(context.length * 0.2),
            });
        }

        contextList.sort((a, b) => b.length - a.length);

        contextList.push({
            text: term,
            length: term.length,
            threshold: Math.floor(term.length * 0.1),
        });

        while (i < textLength) {
            let j,
                substring,
                punctuationOffset = 0,
                cleanedSub;
            let matchedIndex = null;

            for (const [contextIndex, context] of contextList.entries()) {
                if (i + context.length > textLength - 1) {
                    continue;
                } else {
                    substring = text.substring(i, i + context.length);
                    j = i + context.length;

                    cleanedSub = substring.replace(/[^0-9a-zA-Z ]+/g, ' ').replace(/\s+/g, ' ');
                    punctuationOffset = substring.length - cleanedSub.length;

                    while (punctuationOffset > 0 && j + punctuationOffset < textLength) {
                        let newChar = text.substring(j, j + punctuationOffset);
                        if (newChar.includes('\n\n')) {
                            break;
                        }
                        let cleanedNewChar = newChar.replace(/[^0-9a-zA-Z ]+/g, ' ').replace(/\s+/g, ' ');

                        cleanedSub = cleanedNewChar ? cleanedSub + cleanedNewChar : cleanedSub;
                        punctuationOffset = context.length - cleanedSub.length;

                        j += newChar.length;
                    }
                }

                if (context.text === cleanedSub) {
                    if (text.substring(i, Math.min(j, textLength)).includes('\n\n')) {
                        continue;
                    }
                    matchedIndex = contextIndex;

                    let matchedStart = i;

                    let iMatchIndex = map.findIndex(
                        (el) => matchedStart >= el.startOffset && matchedStart <= el.endOffset,
                    );
                    let iMatch = map[iMatchIndex];
                    let jMatchIndex;
                    let jMatch;
                    if (iMatch && j >= iMatch.startOffset && j <= iMatch.endOffset) {
                        jMatchIndex = iMatchIndex;
                        jMatch = map[jMatchIndex];
                    } else {
                        const sliceMap = map.slice(iMatchIndex + 1);
                        jMatchIndex = sliceMap.findIndex((el) => j >= el.startOffset && j <= el.endOffset);
                        jMatchIndex = jMatchIndex + iMatchIndex + 1;
                        jMatch = map[jMatchIndex];
                    }
                    applyHighlight(iMatch, jMatch, iMatchIndex, jMatchIndex);
                    i = jMatch.endOffset + 1;
                    break;
                }
            }
            if (matchedIndex === null) {
                i++;
            }
        }

        return highlightedHtml;
    }

    const highlightedHtml = _highlightInnerText(rawText, htmlDoc, htmlMapping);
    const highlights = highlightedHtml.querySelectorAll('.highlighted-context');

    highlights.forEach((highlight, index) => {
        highlight.setAttribute('id', `context-highlight-${index}`);
    });

    const snippets = Array.from(highlights)
        .map((highlight) => (highlight.innerText || highlight.textContent || '').trim())
        .filter(Boolean);

    return {
        html: highlightedHtml.body.innerHTML,
        snippets,
        hasHighlights: snippets.length > 0,
    };
}

export function countHighlightsForTerm(hpoItemObj, notesList) {
    let total = 0;
    for (const [, noteId] of hpoItemObj.getNotesPresentIn()) {
        const note = notesList.find((n) => n.getId() == noteId);
        if (!note) {
            continue;
        }
        const { snippets } = buildHighlightedNote(note, hpoItemObj);
        total += snippets.length;
    }
    return total;
}
