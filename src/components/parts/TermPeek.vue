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
            this.scrolledIndex = (this.scrolledIndex + 1) % this.lenOfIndexes;
        },
        showLoadingAndParseHtml(tid) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-highlights-indicator';
            loadingDiv.innerText = 'Loading Highlights...';
            document.getElementById('term-peek-div').appendChild(loadingDiv);

            setTimeout(() => {
                this.showFullTermContext(tid)
                    .catch((error) => console.error('Error showing full term context:', error))
                    .finally(() => {
                        const loadingIndicator = document.getElementById('loading-highlights-indicator');
                        if (loadingIndicator) loadingIndicator.remove();
                    });
            }, 50);
        },
        async showFullTermContext(tid) {
            const selectedNote = this.notesList.find((note) => note.getId() === tid);
            this.noteSelected = selectedNote;
            this.fullNoteShown = true;

            try {
                this.currentHighlightedHtml = this.highlightContexts(selectedNote);
                if (!this.currentHighlightedHtml) {
                    this.alertShown = true;
                    this.currentHighlightedHtml = selectedNote.html;
                }
            } catch {
                this.alertShown = true;
                this.currentHighlightedHtml = selectedNote.html;
            }

            await this.$nextTick();

            const firstHighlight = document.getElementById('context-highlight-0');
            if (firstHighlight) {
                const scrollableParent = document.querySelector('.full-note-overlay');
                const headerHeight = document.querySelector('.header-white')?.clientHeight || 0;
                scrollableParent.scrollTop = firstHighlight.offsetTop - scrollableParent.offsetTop - headerHeight - 20;
                firstHighlight.classList.add('scrolled');
            }

            const noteHTMLParent = document.getElementById('note-html-container');
            noteHTMLParent.style.zIndex = 1;
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
            const rawText = note.getText().toLowerCase();
            const parser = new DOMParser();
            const html = parser.parseFromString(note.html, 'text/html');
            const contexts = this.hpoItemObj.getExampleSentences().map((s) => s[0].toLowerCase());
            const term = this.hpoItemObj.getPhenotypeName().toLowerCase();

            let scrollIndex = 0;
            const highlightSpans = [];

            const highlightText = (text, termOrContext, threshold, className) => {
                const termLength = termOrContext.length;
                const matches = [];
                for (let i = 0; i <= text.length - termLength; i++) {
                    const substring = text.slice(i, i + termLength);
                    if (this.getLevenshteinDistance(termOrContext, substring) <= threshold) {
                        matches.push({ start: i, end: i + termLength });
                        i += termLength - 1; // Skip overlapping matches
                    }
                }
                return matches;
            };

            const matches = contexts.flatMap((context) =>
                highlightText(rawText, context, Math.floor(context.length * 0.2), 'highlighted-context')
            );

            if (!matches.length) {
                matches.push(
                    ...highlightText(rawText, term, Math.floor(term.length * 0.1), 'highlighted-context-term')
                );
            }

            matches.forEach(({ start, end }) => {
                const startMatch = htmlMapping.find((m) => start >= m.startOffset && start <= m.endOffset);
                const endMatch = htmlMapping.find((m) => end >= m.startOffset && end <= m.endOffset);

                if (startMatch && endMatch) {
                    const startElement = html.querySelector(this._transformPath(startMatch.parentPath));
                    const endElement = html.querySelector(this._transformPath(endMatch.parentPath));

                    if (startElement && endElement) {
                        const span = document.createElement('span');
                        span.id = `context-highlight-${scrollIndex++}`;
                        span.className = 'highlighted-context';
                        span.innerHTML = startElement.innerHTML + endElement.innerHTML;

                        startElement.innerHTML = '';
                        startElement.appendChild(span);
                        if (startElement !== endElement) endElement.remove();
                    }
                }
            });

            this.lenOfIndexes = scrollIndex;
            this.alertShown = scrollIndex === 0;

            return html.body.innerHTML;
        },
        getLevenshteinDistance(a, b) {
            const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
            for (let i = 1; i <= a.length; i++) {
                let prev = dp[0];
                dp[0] = i;
                for (let j = 1; j <= b.length; j++) {
                    const temp = dp[j];
                    dp[j] = Math.min(
                        dp[j] + 1,
                        dp[j - 1] + 1,
                        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
                    );
                    prev = temp;
                }
            }
            return dp[b.length];
        },
        _transformPath(parentPath) {
            return parentPath
                .split(' > ')
                .map((part) => {
                    const [tag, index] = part.split('[');
                    return index ? `${tag}:nth-child(${+index.replace(']', '') + 1})` : tag;
                })
                .join(' > ');
        },
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
            console.log('scrollHighlight', scrollHighlight);
            if (scrollHighlight) {
                let scrollableParent = document.querySelector('.full-note-overlay');
                if (scrollableParent) {
                    // Account for the sticky header
                    let header = document.querySelector('.header-white');
                    let headerHeight = header ? header.clientHeight : 0;
                    
                    // Get the absolute position of the element relative to the document
                    const rect = scrollHighlight.getBoundingClientRect();
                    const scrollRect = scrollableParent.getBoundingClientRect();
                    
                    // Calculate the scroll position needed to center the element in view
                    // accounting for any nested table structures or other containers
                    const elementTop = rect.top + window.pageYOffset;
                    const containerTop = scrollRect.top + window.pageYOffset;
                    const relativeTop = elementTop - containerTop;
                    
                    // Scroll with offset for header and some padding
                    scrollableParent.scrollTop = relativeTop - headerHeight - 20;
                    
                    // Handle visual highlighting 
                    // Remove highlight from previous element
                    let prevHighlight = document.getElementById(`context-highlight-${oldVal}`);
                    if (prevHighlight) {
                        prevHighlight.classList.remove('scrolled');
                    }
                    
                    // Add highlight to current element
                    scrollHighlight.classList.add('scrolled');
                    
                    // Additional visual indicator for deeply nested elements
                    // Briefly flash the background to draw attention
                    const originalBg = scrollHighlight.style.backgroundColor;
                    scrollHighlight.style.backgroundColor = '#ffd700'; // Gold flash
                    setTimeout(() => {
                        scrollHighlight.style.backgroundColor = originalBg;
                    }, 600);
                }
            }
        },
    },
};
</script>

<style>
.table-div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
}

.table-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
}

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
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: auto;
    position: absolute;
    width: 99%;
    height: 99%;
    z-index: 2;
}

.full-note-overlay * {
    max-width: 100%;
    max-height: 100%;
    box-sizing: border-box;
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
