<template>
    <div id="term-peek-div" :class="{ visible: hpoItemObj }">
        <div class="full-note-overlay" v-if="fullNoteShown && noteSelected">
            <div @click="closeAndResetNote" class="close-note-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>close note inspection</title>
                    <path
                        d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"
                    />
                </svg>
            </div>
            <div v-if="alertShown" class="no-context-alert">Pheno+ was not able to highlight the reference within this note.</div>
            <h3 class="header-white note-title">
                {{ noteSelected.getTitle() }}
                <div id="scroll-btn-wrapper" v-if="lenOfIndexes > 0" @click="incrementScrollIndex()">
                    <div>{{ scrolledIndex + 1 }} / {{ lenOfIndexes }}</div>
                    <div id="next-highlight">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>next</title>
                            <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
                        </svg>
                    </div>
                </div>
            </h3>
            <div id="note-html-container" v-if="currentHighlightedHtml" v-html="currentHighlightedHtml"></div>
            <div v-else-if="noteSelected.html" id="note-html-container" v-html="noteSelected.html"></div>
        </div>
        <div class="sub-container">
            <h3 class="header-white">Notes With Term</h3>
            <div
                @click="showLoadingAndParseHtml(noteTIDPair[1])"
                class="note-title-row"
                v-if="hpoItemObj"
                v-for="noteTIDPair in hpoItemObj.getNotesPresentIn()"
            >
                <div class="exp-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>show full note</title>
                        <path
                            d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z"
                        />
                    </svg>
                </div>
                <span>{{ noteTIDPair[0] }}</span>
            </div>
        </div>

        <div class="sub-container">
            <h3 class="header-white">Context Snips</h3>
            <div v-for="exampleS in exampleSentences">
                <span class="seen-tag"
                    ><b>{{ exampleS[1] }}</b> copies</span
                >
                {{ exampleS[0] }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TermPeek',
    props: {
        hpoItemObj: Object,
        notesList: Array,
    },
    data() {
        return {
            fullNoteShown: false,
            noteSelected: null,
            currentHighlightedHtml: null,
            alertShown: false,
            scrolledIndex: 0,
            lenOfIndexes: 0,
        };
    },
    methods: {
        incrementScrollIndex() {
            if (this.scrolledIndex < this.lenOfIndexes - 1) {
                this.scrolledIndex++;
            } else {
                this.scrolledIndex = 0;
            }
        },
        showLoadingAndParseHtml(tid) {
            // Grab the term-peek-div and add the loading indicator
            let loadingDiv = document.createElement('div');
            loadingDiv.setAttribute('id', 'loading-highlights-indicator');
            loadingDiv.innerText = 'Loading Highlights...';
            document.getElementById('term-peek-div').appendChild(loadingDiv);

            // Force the DOM to update before executing showFullTermContext
            setTimeout(() => {
                this.showFullTermContext(tid)
                    .catch((error) => {
                        // Just log the error for now
                        console.log('Error showing full term context:', error);
                    })
                    .finally(() => {
                        // Remove the loading indicator no matter what
                        let loadingIndicator = document.getElementById('loading-highlights-indicator');
                        if (loadingIndicator) {
                            loadingIndicator.remove();
                        }
                    });
            }, 50);
        },
        async showFullTermContext(tid) {
            let selectedNote;
            selectedNote = this.notesList.find((note) => note.getId() == tid);
            this.noteSelected = selectedNote;
            this.fullNoteShown = true;

            // Highlight the contexts in the note
            try {
                this.currentHighlightedHtml = this.highlightContexts(selectedNote);

                if (!this.currentHighlightedHtml || this.currentHighlightedHtml === '') {
                    this.alertShown = true;
                    let parser = new DOMParser();
                    this.currentHighlightedHtml = parser.parseFromString(selectedNote.html, 'text/html');
                }
            } catch (e) {
                this.alertShown = true;
                let parser = new DOMParser();
                this.currentHighlightedHtml = parser.parseFromString(selectedNote.html, 'text/html');
            }

            // Ensure DOM updates are complete before scrolling
            await this.$nextTick();

            let firstHighlight = document.getElementById('context-highlight-0');
            if (firstHighlight) {
                let scrollableParent = document.querySelector('.full-note-overlay');
                if (scrollableParent) {
                    //account for the sticky header
                    let header = document.querySelector('.header-white');
                    let headerHeight = header ? header.clientHeight : 0;
                    scrollableParent.scrollTop = firstHighlight.offsetTop - scrollableParent.offsetTop - headerHeight - 20;

                    //also add the scrolled class to the first highlight
                    firstHighlight.classList.add('scrolled');
                }
            }

            let noteHTMLParent = document.getElementById('note-html-container');
            //set the z index of all content to be below the header
            noteHTMLParent.style.zIndex = 1;

            //for sanity just remove all images from the note
            noteHTMLParent.querySelectorAll('img').forEach((img) => img.remove());
        },
        closeAndResetNote() {
            this.fullNoteShown = false;
            this.noteSelected = null;
            this.currentHighlightedHtml = null;
            this.scrolledIndex = 0;
            this.lenOfIndexes = 0;
        },
        highlightContexts(note) {
            const htmlMapping = note.getHtmlMapping();
            const rawText = note.getText();
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(note.html, 'text/html');
            const contexts = this.hpoItemObj.getExampleSentences().map((s) => s[0].toLowerCase());
            const term = this.hpoItemObj.getPhenotypeName().toLowerCase();
            const self = this;

            let isFirstHighlight = true;
            let scrollIndex = 0;

            // Cache for transformed paths to avoid recomputation.
            const transformCache = new Map();
            function _transformPath(parentPath) {
                if (transformCache.has(parentPath)) {
                    return transformCache.get(parentPath);
                }
                const parts = parentPath.split(' > ');
                const selector = parts
                    .map((part) => {
                        const [tag, idx] = part.split('[');
                        return idx ? `${tag}:nth-child(${parseInt(idx.replace(']', ''), 10) + 1})` : tag;
                    })
                    .join(' > ');
                transformCache.set(parentPath, selector);
                return selector;
            }

            // _highlightInnerText now encloses the common highlight logic.
            function _highlightInnerText(rawText, html, map) {
                const text = rawText.toLowerCase();
                const textLength = text.length;
                const highlightedHtml = html.cloneNode(true);
                let lastIndex = 0;
                let i = 0;

                // Helper to wrap matching elements in a highlight span.
                function applyHighlight(iMatch, jMatch, iMatchIndex, jMatchIndex, isContextBlock) {
                    let elementCreated = false;
                    // For single or two-element matches we treat them separately.
                    if (jMatchIndex - iMatchIndex === 0) {
                        const elem = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));
                        if (!elem) return;

                        const span = document.createElement('span');
                        span.setAttribute('id', `context-highlight-${scrollIndex}`);
                        span.setAttribute('class', 'highlighted-context');
                        span.innerText = elem.innerText;
                        elem.innerHTML = '';
                        elem.appendChild(span);
                        elementCreated = true;
                    } else if (jMatchIndex - iMatchIndex === 1) {
                        const iElement = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));
                        const jElement = highlightedHtml.querySelector(_transformPath(jMatch.parentPath));
                        if (!iElement || !jElement) return;

                        const span = document.createElement('span');
                        span.setAttribute('id', `context-highlight-${scrollIndex}`);
                        span.setAttribute('class', 'highlighted-context');
                        span.innerText = iElement.innerText + jElement.innerText;
                        iElement.innerHTML = '';
                        jElement.remove();
                        iElement.appendChild(span);
                        elementCreated = true;
                    } else {
                        // For multiple elements, combine them differently for context vs. term.
                        const fullSpan = document.createElement('span');
                        fullSpan.setAttribute('id', `context-highlight-${scrollIndex}`);
                        fullSpan.setAttribute('class', 'highlighted-context');

                        if (isContextBlock) {
                            let combinedText = '';
                            for (let k = iMatchIndex; k <= jMatchIndex; k++) {
                                const el = map[k];
                                const element = highlightedHtml.querySelector(_transformPath(el.parentPath));
                                if (element) combinedText += element.innerText;
                                if (k !== iMatchIndex) element.remove();
                            }
                            fullSpan.innerText = combinedText;
                        } else {
                            // For term highlight, overwrite each element’s innerHTML and remove later ones.
                            for (let k = iMatchIndex; k <= jMatchIndex; k++) {
                                const el = map[k];
                                const element = highlightedHtml.querySelector(_transformPath(el.parentPath));
                                if (element) {
                                    fullSpan.innerHTML = element.innerHTML;
                                    if (k !== iMatchIndex) element.remove();
                                }
                            }
                        }

                        const firstElem = highlightedHtml.querySelector(_transformPath(iMatch.parentPath));
                        if (firstElem) {
                            firstElem.innerHTML = '';
                            firstElem.appendChild(fullSpan);
                            elementCreated = true;
                        }
                    }
                    if (elementCreated) {
                        scrollIndex++;
                    }
                }

                let contextList = [];
                for (const context of contexts) {
                    let newContext = {
                        text: context.toLowerCase(),
                        length: context.length,
                        threshold: Math.floor(context.length * 0.2),
                    };
                    contextList.push(newContext);
                }

                while (i <= textLength) {
                    let j, substring;

                    for (const context of contextList) {
                        if (i + context.length > textLength) {
                            substring = text.substring(i);
                            j = textLength;
                        } else {
                            substring = text.substring(i, i + context.length);
                            j = i + context.length;
                        }

                        const distance = self.getLevenshteinDistance(context.text, substring);
                        if (distance <= context.threshold) {
                            isFirstHighlight = false;
                            // Find matching mapping entries for start (i) and end (j).
                            let iMatchIndex = map.findIndex((el) => i >= el.startOffset && i <= el.endOffset);
                            const iMatch = map[iMatchIndex];
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
                            applyHighlight(iMatch, jMatch, iMatchIndex, jMatchIndex, true);
                            lastIndex = j;
                            i = j;
                        }
                    }
                    i++;
                }

                // If no context was highlighted, try highlighting the term.
                if (isFirstHighlight) {
                    const windowLength = term.length;
                    const termThreshold = Math.floor(windowLength * 0.1);
                    if (windowLength <= textLength) {
                        i = 0;
                        while (i <= textLength - termThreshold) {
                            let j, substring;
                            if (i + windowLength > textLength) {
                                substring = text.substring(i);
                                j = textLength;
                            } else {
                                substring = text.substring(i, i + windowLength);
                                j = i + windowLength;
                            }
                            const distance = self.getLevenshteinDistance(term, substring);
                            if (distance <= termThreshold) {
                                isFirstHighlight = false;
                                let iMatchIndex = map.findIndex((el) => i >= el.startOffset && i <= el.endOffset);
                                const iMatch = map[iMatchIndex];
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
                                applyHighlight(iMatch, jMatch, iMatchIndex, jMatchIndex, false);
                                lastIndex = j;
                                i = j;
                            } else {
                                i++;
                            }
                        }
                    }
                }

                self.alertShown = isFirstHighlight;
                return highlightedHtml;
            }

            let newHtml = htmlDoc.cloneNode(true);
            try {
                newHtml = _highlightInnerText(rawText, htmlDoc, htmlMapping);
            } catch (e) {
                console.log('Error highlighting inner text:', e);
            }

            //Grab all the highlights
            let highlights = newHtml.querySelectorAll('.highlighted-context');

            //update all of the ids going 0-> n
            highlights.forEach((highlight, index) => {
                highlight.setAttribute('id', `context-highlight-${index}`);
            });
            //set the scroll index to the number of highlights
            scrollIndex = highlights.length;

            this.lenOfIndexes = scrollIndex;
            return newHtml.body.innerHTML;
        },
        getLevenshteinDistance(a, b) {
            if (a === b) return 0;
            const aLen = a.length;
            const bLen = b.length;
            if (aLen === 0) return bLen;
            if (bLen === 0) return aLen;

            // Always use the shorter string for the inner loop to reduce memory usage
            if (aLen > bLen) {
                [a, b] = [b, a];
            }

            const shorterLen = a.length;
            const longerLen = b.length;

            let prevRow = new Array(shorterLen + 1);
            let currRow = new Array(shorterLen + 1);

            // Initialize previous row: distances for transforming "" into a substring of `a`
            for (let i = 0; i <= shorterLen; i++) {
                prevRow[i] = i;
            }

            // Build distances row by row
            for (let j = 1; j <= longerLen; j++) {
                currRow[0] = j;
                const bChar = b[j - 1];
                for (let i = 1; i <= shorterLen; i++) {
                    const cost = a[i - 1] === bChar ? 0 : 1;
                    currRow[i] = Math.min(
                        currRow[i - 1] + 1, // insertion
                        prevRow[i] + 1, // deletion
                        prevRow[i - 1] + cost, // substitution
                    );
                }
                // Swap rows for next iteration
                [prevRow, currRow] = [currRow, prevRow];
            }

            return prevRow[shorterLen];
        },
    },
    computed: {
        exampleSentences() {
            if (!this.hpoItemObj) {
                return [];
            }
            return this.hpoItemObj.getExampleSentences();
        },
    },
    watch: {
        hpoItemObj: function (newVal, oldVal) {
            this.closeAndResetNote();
        },
        scrolledIndex: function (newVal, oldVal) {
            let scrollHighlight = document.getElementById(`context-highlight-${this.scrolledIndex}`);
            if (scrollHighlight) {
                let scrollableParent = document.querySelector('.full-note-overlay');
                if (scrollableParent) {
                    // Account for the sticky header
                    let header = document.querySelector('.header-white');
                    let headerHeight = header ? header.clientHeight : 0;

                    // Use a simpler, more direct approach to calculate scroll position
                    // This positions the highlight at the top of the viewport (accounting for header)
                    const highlightRect = scrollHighlight.getBoundingClientRect();
                    const containerRect = scrollableParent.getBoundingClientRect();

                    // Calculate how much we need to scroll to bring the highlight to the top
                    // (just below the header)
                    const offsetNeeded = highlightRect.top - containerRect.top - headerHeight - 10;

                    // Apply the scroll
                    scrollableParent.scrollTop += offsetNeeded;

                    // Handle visual highlighting
                    // Remove highlight from previous element
                    let prevHighlight = document.getElementById(`context-highlight-${oldVal}`);
                    if (prevHighlight) {
                        prevHighlight.classList.remove('scrolled');
                    }

                    // Add highlight to current element
                    scrollHighlight.classList.add('scrolled');

                    // Enhance visibility for deeply nested elements
                    scrollHighlight.style.outline = '2px solid #0b4b99';
                    scrollHighlight.style.boxShadow = '0 0 8px rgba(11, 75, 153, 0.6)';

                    // Flash effect
                    const originalBg = scrollHighlight.style.backgroundColor || '#fff19583';
                    scrollHighlight.style.backgroundColor = '#ffd700'; // Gold flash
                    setTimeout(() => {
                        scrollHighlight.style.backgroundColor = originalBg;
                        scrollHighlight.style.outline = 'none';
                        scrollHighlight.style.boxShadow = 'none';
                    }, 800);
                }
            }
        },
    },
};
</script>

<style>
#loading-highlights-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    font-weight: bold;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    color: black;
    z-index: 3;
}

#term-peek-div {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 0px;
    background-color: white;
    border-radius: 3px;
    margin-left: 0px;
    font-style: italic;
    padding: 0px 5px 5px 5px;
    transition: all 0.45s ease-in-out;
    overflow: hidden;
    color: rgb(72, 71, 71);
}

#scroll-btn-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 5px;
    position: absolute;
    right: 2px;
    bottom: -20px;
    background-color: white;
    font-size: 10pt;
    border: 1px solid #0b4b99;
    padding: 2px 5px;
    border-radius: 5px;
}

#next-highlight {
    cursor: pointer;
    margin-left: 5px;
    height: 25px;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;

    background-color: gray;
    border-radius: 5px;
}

#next-highlight:hover {
    background-color: #0b4b99;
}

#next-highlight > svg {
    height: 20px;
    width: 20px;
    fill: white;
}

.seen-tag {
    background-color: aliceblue;
    color: #0b4b99;
    margin-left: 5px;
    margin-right: 5px;
    font-weight: bold;
    font-style: normal;
    padding: 2px 4px;
    border-radius: 5px;
}

.seen-tag > b {
    text-decoration: underline;
}

.seen-tag > i {
    color: gray;
}

.no-context-alert {
    font-size: 12pt;
    font-weight: bold;
    color: red;
    margin-left: 5px;
    padding: 5px 5px;
    position: absolute;
    top: 3px;
    left: 0;
    background-color: rgba(250, 202, 202, 0.4);
    border-radius: 5px;
    z-index: 3;
}

.header-white {
    background-color: white;
}

#term-peek-div.visible {
    width: 60%;
    margin-left: 5px;
    overflow-y: auto;
}

#term-peek-div > .sub-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    height: 50%;
}

#term-peek-div h3 {
    font-size: 12pt;
    padding-top: 10px;
    width: 100%;
    text-align: center;
    position: sticky;
    box-sizing: border-box;
    top: 0;
    margin-top: 0px;
    background-color: white;
}

.note-title {
    z-index: 2;
    font-size: 1.1em;
}

#term-peek-div > .sub-container > div {
    text-align: center;
    border-bottom: 1px solid rgb(209, 209, 209);
    padding-bottom: 5px;
    padding-top: 5px;
    margin-left: 5px;
    margin-right: 5px;
}

.note-title-row {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

.note-title-row:hover {
    background-color: #e2e2e2;
}

.exp-btn {
    cursor: pointer;
    margin-right: 5px;
    height: 25px;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
}

.exp-btn > svg {
    height: 20px;
    width: 20px;
    fill: #0b4b99;
}

.exp-btn:hover {
    background-color: #e2e2e2;
}

.full-note-overlay {
    align-items: flex-start;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: auto;
    position: absolute;
    box-sizing: border-box;
    width: 99%;
    height: 99%;
    z-index: 2;
}

.full-note-overlay > * {
    max-width: 100%;
    max-height: 100%;
    overflow-wrap: break-word; /* Ensure long words break instead of overflowing */
}

.close-note-overlay {
    position: sticky;
    top: 0;
    z-index: 3;
    width: 25px;
    height: 25px;
    align-self: flex-end;
    border-radius: 5px;
    margin-top: 2px;
    margin-right: 2px;
    background-color: white;
}

.close-note-overlay > svg {
    fill: #0b4b99;
    cursor: pointer;
}

.close-note-overlay:hover {
    background-color: #e2e2e2;
}

.highlighted-context {
    background-color: #fff19583;
    border-radius: 3px;
    padding: 1px 0px;
    margin: 0px;
    display: inline-block;
}

.highlighted-context-term {
    background-color: #fff19583;
    border-radius: 3px;
    padding: 1px 0px;
    margin: 0px;
}

.highlighted-context-term.scrolled,
.highlighted-context.scrolled {
    text-decoration: underline;
    text-decoration-color: #0b4b99;
    text-decoration-thickness: 2px;
    font-weight: bold;
}
</style>
