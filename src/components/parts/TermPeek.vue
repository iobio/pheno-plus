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
                <div>{{ noteSelected.getTitle() }}</div>
                <div id="scroll-btn-wrapper">
                    <div class="scroll-btn-term" @click.stop>{{ phenotypeName }}</div>
                    <template v-if="lenOfIndexes > 0">
                        <div @click="incrementScrollIndex()">{{ scrolledIndex + 1 }} / {{ lenOfIndexes }}</div>
                        <div id="next-highlight" @click="incrementScrollIndex()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <title>next</title>
                                <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
                            </svg>
                        </div>
                    </template>
                </div>
            </h3>
            <div id="note-html-container" v-if="currentHighlightedHtml" v-html="currentHighlightedHtml"></div>
            <div v-else-if="noteSelected.html" id="note-html-container" v-html="noteSelected.html"></div>
        </div>
        <div class="sub-container">
            <h3 class="header-white">Notes with {{ phenotypeName }}</h3>
            <div
                @click="showLoadingAndParseHtml(noteTIDPair[1])"
                class="note-title-column"
                v-if="hpoItemObj"
                v-for="noteTIDPair in hpoItemObj.getNotesPresentIn()"
            >
                <div class="note-title-row">
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
                <div
                    class="context-snip"
                    v-for="(snippet, snippetIndex) in contextSnippetsByNoteId[noteTIDPair[1]] || []"
                    :key="`${noteTIDPair[1]}-${snippetIndex}`"
                >
                    {{ snippet }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { buildHighlightedNote } from '../../utils/noteHighlighting.js';

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
            contextSnippetsByNoteId: {},
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
            let loadingDiv = document.createElement('div');
            loadingDiv.setAttribute('id', 'loading-highlights-indicator');
            loadingDiv.innerText = 'Loading Highlights...';
            document.getElementById('term-peek-div').appendChild(loadingDiv);

            this.noteSelected = this.notesList.find((note) => note.getId() == tid);
            this.alertShown = false;
            this.currentHighlightedHtml = null;
            this.scrolledIndex = 0;

            setTimeout(() => {
                void (async () => {
                    try {
                        await this.showFullTermContext();
                    } catch (error) {
                        console.error('Error showing full term context:', error);
                        this.alertShown = true;
                        this.currentHighlightedHtml = this.noteSelected.html;
                    } finally {
                        let loadingIndicator = document.getElementById('loading-highlights-indicator');
                        if (loadingIndicator) {
                            loadingIndicator.remove();
                        }
                    }
                })();
            }, 10);
        },
        async showFullTermContext() {
            this.fullNoteShown = true;

            const html = await this.highlightContexts(this.noteSelected);
            this.currentHighlightedHtml = html || this.noteSelected.html;

            if (!html) {
                this.alertShown = true;
            }

            await this.$nextTick();

            let firstHighlight = document.getElementById('context-highlight-0');

            if (firstHighlight) {
                let scrollableParent = document.querySelector('.full-note-overlay');
                if (scrollableParent) {
                    let header = document.querySelector('.header-white');
                    let headerHeight = header ? header.clientHeight : 0;
                    scrollableParent.scrollTop =
                        firstHighlight.offsetTop - scrollableParent.offsetTop - headerHeight - 20;

                    firstHighlight.classList.add('scrolled');
                }
            }

            let noteHTMLParent = document.getElementById('note-html-container');
            if (noteHTMLParent) {
                noteHTMLParent.style.zIndex = 1;
                noteHTMLParent.querySelectorAll('img').forEach((img) => img.remove());
            }
        },
        closeAndResetNote() {
            this.fullNoteShown = false;
            this.noteSelected = null;
            this.currentHighlightedHtml = null;
            this.scrolledIndex = 0;
            this.lenOfIndexes = 0;
        },
        async refreshContextSnippets() {
            if (!this.hpoItemObj) {
                this.contextSnippetsByNoteId = {};
                return;
            }

            const snippetsByNoteId = {};
            for (const [, noteId] of this.hpoItemObj.getNotesPresentIn()) {
                const note = this.notesList.find((n) => n.getId() == noteId);
                if (!note) {
                    continue;
                }
                const { snippets } = buildHighlightedNote(note, this.hpoItemObj);
                snippetsByNoteId[noteId] = snippets;
            }
            this.contextSnippetsByNoteId = snippetsByNoteId;
        },
        async highlightContexts(note) {
            try {
                const { html, snippets, hasHighlights } = buildHighlightedNote(note, this.hpoItemObj);
                this.lenOfIndexes = snippets.length;
                this.alertShown = !hasHighlights;
                return html;
            } catch (error) {
                console.error('Error highlighting inner text:', error);
                this.alertShown = true;
                const parser = new DOMParser();
                return parser.parseFromString(note.html, 'text/html').body.innerHTML;
            }
        },
    },
    computed: {
        phenotypeName() {
            return this.hpoItemObj ? this.hpoItemObj.getPhenotypeName() : '';
        },
    },
    watch: {
        hpoItemObj: function (newVal, oldVal) {
            this.closeAndResetNote();
            this.contextSnippetsByNoteId = {};
            if (newVal) {
                void this.refreshContextSnippets();
            }
        },
        scrolledIndex: function (newVal, oldVal) {
            let scrollHighlight = document.getElementById(`context-highlight-${newVal}`);
            if (scrollHighlight) {
                let scrollableParent = document.querySelector('.full-note-overlay');
                if (scrollableParent) {
                    // Account for the sticky header
                    let header = document.querySelector('.header-white');
                    let headerHeight = header ? header.clientHeight : 0;

                    // This positions the highlight at the top of the viewport (accounting for header)
                    const highlightRect = scrollHighlight.getBoundingClientRect();
                    const containerRect = scrollableParent.getBoundingClientRect();

                    // Calculate how much we need to scroll to bring the highlight to the top
                    const offsetNeeded = highlightRect.top - containerRect.top - headerHeight - 10;
                    scrollableParent.scrollTop += offsetNeeded;

                    // Add highlight to current element
                    scrollHighlight.classList.add('scrolled');

                    // Remove highlight from previous element
                    let prevHighlight = document.getElementById(`context-highlight-${oldVal}`);
                    if (prevHighlight && prevHighlight.classList.contains('scrolled')) {
                        prevHighlight.classList.remove('scrolled');
                    }
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
    padding: 0px 5px 5px 5px;
    transition: all 0.45s ease-in-out;
    overflow: hidden;
    color: rgb(72, 71, 71);
    font-size: var(--text-md);
}

#scroll-btn-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    position: absolute;
    right: 30px;
    background-color: white;
    font-size: 0.833em;
    border: 1px solid #0b4b99;
    padding: 2px 5px;
    border-radius: 5px;
    color: white;
    box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    background-color: rgb(0, 113, 189);
    font-style: italic;
    cursor: pointer;
}

.scroll-btn-term {
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
    font-style: italic;
    font-size: var(--text-xs);
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

    background-color: rgb(12, 162, 255);
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

.no-context-alert {
    font-size: var(--text-md);
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
    height: 100%;
    
}

#term-peek-div h3 {
    font-size: var(--text-md);
    padding-top: 10px;
    width: 100%;
    text-align: center;
    position: sticky;
    box-sizing: border-box;
    top: 0;
    margin-top: 0px;
    background-color: #eaeaea;
    min-height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.note-title {
    z-index: 2;
    font-size: var(--text-lg);
}

#term-peek-div > .sub-container > div {
    text-align: center;
    border-bottom: 1px solid rgb(221, 220, 220);
    margin-left: 5px;
    margin-right: 5px;
}

.note-title-column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 0.5px solid transparent;
}

.note-title-column:hover {
    border: 0.5px solid #e2e2e2;
    border-radius: 5px;
    background-color: #f6f6f6;
    cursor: pointer;
}

.note-title-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    padding: 5px 0px;
    pointer-events: none;
    font-size: var(--text-sm);
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
}

.close-note-overlay > svg {
    fill: #0b4b99;
    cursor: pointer;
}

.close-note-overlay:hover {
    background-color: #e2e2e2;
}

.highlighted-context {
    background-color: #d8ff7273;
    border-radius: 3px;
    padding: 1px 0px;
    margin: 0px;
    display: inline-block;
}

.highlighted-context-term {
    border-radius: 3px;
    padding: 1px 0px;
    margin: 0px;
}

.highlighted-context-term.scrolled,
.highlighted-context.scrolled {
    border-color: #82ba00;
    border-style: solid;
    border-width: 2px;
    text-decoration-color: black;
    text-decoration-thickness: 2px;
    font-weight: bold;
}

.context-snip {
    align-self: flex-start;
    padding: 5px 5px;
    margin-left: 30px;
    margin-right: 5px;
    margin-bottom: 5px;
    background-color: #d3f47e45;
    pointer-events: none;
    font-style: italic;
    font-size: var(--text-xs);
    text-align: left;
}
.silent {
    display: none;
    height: 0px;
    width: 0px;
    overflow: hidden;
    margin: 0px;
    padding: 0px;
}
</style>
