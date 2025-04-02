<template>
    <div id="the-main-container">
        <div id="loading-overlay" :class="{ hidden: hideOverlay }">
            <div id="spinner-container">
                <svg id="spinner" width="195" height="195" viewBox="-4 -4 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 50,6 A 50,50 0 0,1 85.36,35.36" fill="none" stroke="#1B5590" stroke-width="9" />
                </svg>
                <p v-if="hideOverlayFromApp">
                    Loading <br />
                    HPO <br />
                    Terms...
                </p>
                <p v-else>
                    Pulling <br />
                    Notes <br />
                    ...
                </p>
            </div>
        </div>

        <div id="selector-view-container" :class="{ closed: !selectorViewOpen }">
            <div class="open-close" @click="selectorViewOpen = !selectorViewOpen">
                <img v-if="selectorViewOpen" src="../assets/close.svg" alt="close section" />
                <img v-else src="../assets/dots-hz.svg" alt="open section" />
                <div class="open-close-label">
                    {{ selectorViewOpen ? 'Close Notes Section' : 'Open Notes Section' }}
                </div>
            </div>

            <div class="content-title-wrapper item-selector" :class="{ closed: !selectorViewOpen, fullWidth: !noteContentOpen }">
                <h3 @mouseenter="showNotesPulledTip = true" @mouseleave="showNotesPulledTip = false" id="item-selector-header">
                    Relevant EHR Notes ({{ notesNum }})
                </h3>
                <ItemSelector
                    :notesList="notesList"
                    :selectedNote="selectedNote"
                    :alreadyProcessed="notesAlreadyProcessed"
                    :isCheckedMap="isCheckedMap"
                    :allChecked="allChecked"
                    @selectNote="selectNote"
                    @updateIsCheckedMap="updateIsCheckedMap"
                    @uncheckAll="uncheckAll"
                    @checkAll="checkAll"
                >
                </ItemSelector>
                <button class="process-btn all" @click="processTextAll" :disabled="checkForChecked() || allNotesProcessed">
                    Process Selected Notes
                </button>
            </div>

            <div class="open-close note-preview" @click="noteContentOpen = !noteContentOpen" v-if="selectorViewOpen">
                <div class="open-close-label">
                    {{ noteContentOpen ? 'Close Note Preview' : 'Open Note Preview' }}
                </div>
                <img v-if="noteContentOpen" src="../assets/close.svg" alt="close section" />
                <img v-else src="../assets/dots-hz.svg" alt="open section" />
            </div>
            <div class="content-title-wrapper view-info" :class="{ closed: !selectorViewOpen, closedWidth: !noteContentOpen }">
                <h3>Note Content Preview</h3>
                <ViewInfo :note="selectedNote" @textChanged="changeTextContent"> </ViewInfo>
            </div>
        </div>

        <div id="full-width-box-container" :class="{ closed: !fullWidthBoxOpen }">
            <div class="open-close" @click="fullWidthBoxOpen = !fullWidthBoxOpen">
                <img v-if="fullWidthBoxOpen" src="../assets/close.svg" alt="close section" />
                <img v-else src="../assets/dots-hz.svg" alt="open section" />
                <div class="open-close-label">
                    {{ fullWidthBoxOpen ? 'Close HPO Terms Section' : 'Open HPO Terms Section' }}
                </div>
            </div>
            <div id="term-table" :class="{ closed: !fullWidthBoxOpen }">
                <TermDashboard
                    :hpoItemsObj="hpoTermsObj"
                    :sortedHpoList="sortedHpoList"
                    :baseInformationOnly="baseInformationOnly"
                    :selectedTerm="selectedTerm"
                    @removeItem="removeHpoTerm"
                    @updateItem="updateHpoTerm"
                    @sendTerms="formatAndPopulateTerms"
                    @clearTableTerms="clearAllTableTerms"
                    @selectTerm="selectTerm"
                    @addTerm="addTermFromUser"
                >
                </TermDashboard>
                <TermPeek :hpoItemObj="selectedTerm" :notesList="notesList"></TermPeek>
            </div>
            <ClipBoardBox
                :class="{ closed: !fullWidthBoxOpen }"
                :clipBoardTerms="clipTerms"
                @clearClipboardTerms="clearClipTerms"
            ></ClipBoardBox>
        </div>
    </div>
</template>

<script>
import ViewInfo from './parts/ViewInfo.vue';
import ItemSelector from './parts/ItemSelector.vue';
import TermDashboard from './parts/TermDashboard.vue';
import ClipBoardBox from './parts/ClipBoardBox.vue';
import fetchFromGru from '../data/fetchFromGru';
import ChartItem from '../models/ChartItem.js';
import TermPeek from './parts/TermPeek.vue';

export default {
    name: 'MainContainer',
    components: {
        ViewInfo,
        ItemSelector,
        TermDashboard,
        ClipBoardBox,
        TermPeek,
    },
    props: {
        notesList: Array,
        notesNum: Number,
        hideOverlayFromApp: Boolean,
        totalNotes: Number,
    },
    data() {
        return {
            selectedNote: null,
            selectedNoteTextContent: null,
            notesAlreadyProcessed: [],
            hpoTermsObj: {},
            clipTerms: [],
            // hideOverlay: this.hideOverlayFromApp,
            hideOverlay: true,
            baseInformationOnly: true,
            sortedHpoList: [],
            selectedTerm: null,
            allChecked: false,
            isCheckedMap: this.isCheckedMapStart || {},
            showNotesPulledTip: false,
            selectorViewOpen: true,
            noteContentOpen: false,
            fullWidthBoxOpen: false,
        };
    },
    async mounted() {},
    methods: {
        selectTerm(term) {
            if (this.selectedTerm === null && term !== null) {
                this.selectedTerm = term;
                return;
            } else if (term == null || this.selectedTerm.hpoId === term.hpoId) {
                this.selectedTerm = null;
                return;
            } else {
                this.selectedTerm = term;
            }
        },
        selectNote(note) {
            if (!this.selectedNote || this.selectedNote.id !== note.id) {
                this.selectedNote = note;
                this.noteContentOpen = true;
            } else {
                this.noteContentOpen = !this.noteContentOpen;
            }
        },
        removeHpoTerm(id) {
            if (this.selectedTerm !== null && this.selectedTerm.hpoId === id) {
                this.selectedTerm = null;
            }
            this.sortedHpoList = this.sortedHpoList.filter((item) => item[0] !== id);
            delete this.hpoTermsObj[id];
        },
        updateHpoTerm(item) {
            this.hpoTermsObj[item.getHpoId()] = item;

            //we need to sort the list again incase
            this.sortedHpoList = Object.values(this.hpoTermsObj)
                .sort((a, b) => b.numOccurrences - a.numOccurrences)
                .map((item) => [item.hpoId, item.numOccurrences]);

            //Sort all the terms in the sorted list again and put any that have the 'use' property false to the bottom
            let sortedToBottom = this.sortedHpoList.filter((item) => !this.hpoTermsObj[item[0]].getUse());
            let sortedToTop = this.sortedHpoList.filter((item) => this.hpoTermsObj[item[0]].getUse());

            this.sortedHpoList = sortedToTop.concat(sortedToBottom);
        },
        formatAndPopulateTerms() {
            //Needs to populate the clipboard box with the terms
            let terms = [];
            for (let key in this.hpoTermsObj) {
                let item = this.hpoTermsObj[key];
                if (item.getUse()) {
                    terms.push(item);
                }
            }
            this.clipTerms = terms;
        },
        clearClipTerms() {
            this.clipTerms = [];
        },
        clearAllTableTerms() {
            //Clear all the terms from the table and open the selector view and close the full width box
            this.fullWidthBoxOpen = false;
            this.selectorViewOpen = true;

            this.hpoTermsObj = {};
            this.sortedHpoList = [];
            this.notesAlreadyProcessed = [];
            this.selectedTerm = null;
        },
        async processText() {
            //If nothing is selected dont process
            if (this.selectedNote === null) {
                return;
            }

            //If the item has already been processed dont add it to the list again
            if (!this.notesAlreadyProcessed.includes(this.selectedNote.id)) {
                this.notesAlreadyProcessed.push(this.selectedNote.id);
            } else {
                return;
            }

            //Show the loading overlay
            this.hideOverlay = false;
            let gru_data = await fetchFromGru(this.selectedNoteTextContent);

            if (gru_data) {
                const clinPhen = gru_data.clinPhenData;
                //Clinphen is an object of objects, each object is a term the key is the hpo id
                for (let key in clinPhen) {
                    if (this.hpoTermsObj[key]) {
                        //clinPhen Example sentance is always an array, usually of one element but sometimes more
                        for (let i = 0; i < clinPhen[key]['Example sentence'].length; i++) {
                            let clinPhenSen = clinPhen[key]['Example sentence'][i].trim().toLowerCase();
                            //Any example sentence will have a corresponding earliness value
                            let earliness = clinPhen[key]['Earliness (lower = earlier)'][i];

                            let sentenceAlreadySeen = false;
                            for (let i = 0; i < this.hpoTermsObj[key].exampleSentences.length; i++) {
                                let currSen = this.hpoTermsObj[key].exampleSentences[i][0].trim().toLowerCase();
                                //Check if the sentence is already in the list
                                if (currSen == clinPhenSen) {
                                    this.hpoTermsObj[key].addToTimesSeen(i);
                                    sentenceAlreadySeen = true;
                                }
                            }

                            if (!sentenceAlreadySeen) {
                                //If this clinPhen sentence is not already in the list add it
                                this.hpoTermsObj[key].addToNumOccurrences(clinPhen[key]['No. occurrences']);

                                //Use the singular adding methods to add the earliness and example sentence
                                this.hpoTermsObj[key].addToEarliness(earliness);
                                this.hpoTermsObj[key].addToExampleSentences(clinPhenSen);
                            }
                        }

                        //It technically shouldnt be possible to add the same note twice via the UI but there is a
                        //check on this method to prevent it from happening if it does
                        this.hpoTermsObj[key].addToNotesPresentIn([this.selectedNote.title, this.selectedNote.id]);
                        continue;
                    }

                    //otherwise just add it to the list we haven't seen it before
                    let item = new ChartItem(clinPhen[key], [[this.selectedNote.title, this.selectedNote.id]]);
                    this.hpoTermsObj[key] = item;
                }

                let sortedTerms = Object.values(this.hpoTermsObj)
                    .sort((a, b) => b.numOccurrences - a.numOccurrences)
                    .map((item) => [item.hpoId, item.numOccurrences]);

                let sortedToBottom = sortedTerms.filter((item) => !this.hpoTermsObj[item[0]].getUse());
                let sortedToTop = sortedTerms.filter((item) => this.hpoTermsObj[item[0]].getUse());
                sortedTerms = sortedToTop.concat(sortedToBottom);

                this.sortedHpoList = sortedTerms;
                this.hideOverlay = true;
                this.selectorViewOpen = false;
            } else {
                this.hideOverlay = true;
                this.selectorViewOpen = false;
            }
        },
        async processTextAll() {
            //For each of the notes in the notes list process the text
            for (let note of this.notesList) {
                //Call the process text function
                if (this.isCheckedMap[note.id] == false) {
                    continue;
                } else {
                    this.selectedNote = note;
                    this.selectedNoteTextContent = note.text;
                    await this.processText();
                }
            }
        },
        changeTextContent(textContent) {
            this.selectedNoteTextContent = textContent;
        },
        updateIsCheckedMap(noteId) {
            this.isCheckedMap[noteId] = !this.isCheckedMap[noteId];

            if (this.isCheckedMap[noteId] == false) {
                this.allChecked = false;
            } else {
                let allChecked = true;
                for (let note of this.notesList) {
                    if (this.isCheckedMap[note.id] == false) {
                        allChecked = false;
                        break;
                    }
                }
                this.allChecked = allChecked;
            }
        },
        checkAll() {
            for (let note of this.notesList) {
                this.isCheckedMap[note.id] = true;
            }
            this.allChecked = true;
        },
        uncheckAll() {
            for (let note of this.notesList) {
                this.isCheckedMap[note.id] = false;
            }
            this.allChecked = false;
        },
        checkForChecked() {
            for (let note of this.notesList) {
                if (Object.keys(this.isCheckedMap).length == 0) {
                    return true;
                }
                if (this.isCheckedMap[note.id] == true) {
                    return false;
                }
            }
            return true;
        },
        addTermFromUser(term) {
            this.hpoTermsObj[term.hpoId] = term;
            this.sortedHpoList = Object.values(this.hpoTermsObj)
                .sort((a, b) => b.numOccurrences - a.numOccurrences)
                .map((item) => [item.hpoId, item.numOccurrences]);
        },
    },
    computed: {
        isCheckedMapStart() {
            let map = {};
            for (let note of this.notesList) {
                map[note.id] = false;
            }
            return map;
        },
        allNotesProcessed() {
            return this.notesAlreadyProcessed.length === this.notesList.length;
        },
    },
    watch: {
        isCheckedMapStart: function (val) {
            this.isCheckedMap = val;
        },
        hideOverlayFromApp: function (val) {
            this.hideOverlay = val;
        },
        notesList: function (newVal, oldVal) {
            if (newVal && newVal.length > 0 && newVal !== oldVal) {
                this.selectNote(newVal[0]);
            }
        },
        sortedHpoList: {
            handler: function (newVal, oldVal) {
                if (newVal && newVal.length > 0 && newVal !== oldVal) {
                    this.fullWidthBoxOpen = true;
                }
            },
            deep: true,
        },
    },
};
</script>

<style lang="css">
#item-selector-header {
    position: relative;
}
#notes-pulled-tip {
    position: absolute;
    top: 0px;
    left: 50%;
    font-size: small;
    font-style: italic;
    margin-top: 0px;
    background-color: white;
    opacity: 0.8;
    padding: 10px;
    border-radius: 3px;
    max-width: 150px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    z-index: 4;
}
.small-italic {
    font-size: x-small;
}

h3 {
    width: 100%;
    border-radius: 3px 3px 0px 0px;
    margin-top: 0px;
    margin-bottom: 0px;
}

#the-main-container {
    height: 100%;
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
}

#selector-view-container,
#full-width-box-container {
    border: 1px solid transparent;
    border-radius: 5px;
    box-sizing: border-box;
    transition:
        flex-grow 0.3s ease-in-out,
        border 0.4s ease-in-out;
}

#selector-view-container {
    position: relative;
    align-items: center;
    display: flex;
    flex-direction: row;
    flex: 1 1 45%;
    justify-content: space-between;
    overflow: hidden;
    width: 93%;
}

#full-width-box-container {
    position: relative;
    align-items: center;
    display: flex;
    flex-direction: column;
    flex: 1 1 55%;
    justify-content: space-evenly;
    overflow: hidden;
    width: 93%;
}

#selector-view-container.closed {
    flex: 0 0 55px;
    border: 1px solid rgba(0, 0, 0, 0.2);
}

#full-width-box-container.closed {
    flex: 0 0 55px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    margin-top: 20px;
}

#full-width-box-container .open-close {
    transition: top 0.3s ease-in-out;
    align-items: center;
    color: #0071bd;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-style: italic;
    font-weight: bold;
    left: 5px;
    position: absolute;
    top: 16px;
    z-index: 3;
}

#full-width-box-container.closed .open-close {
    top: 13px;
}

#selector-view-container .open-close {
    transition: top 0.3s ease-in-out;
    align-items: center;
    color: #0071bd;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-style: italic;
    font-weight: bold;
    left: 5px;
    position: absolute;
    top: 0px;
    z-index: 3;
}

#selector-view-container .open-close.note-preview {
    right: 5px;
    top: 2px;
    left: auto;
}

#selector-view-container.closed .open-close {
    top: 10px;
}

#selector-view-container .open-close img {
    height: 30px;
    width: 30px;
    pointer-events: none;
}

#selector-view-container .open-close-label,
#full-width-box-container .open-close-label {
    margin-left: 10px;
}

#selector-view-container .note-preview .open-close-label {
    margin-right: 10px;
}

#full-width-box-container .open-close img {
    height: 30px;
    width: 30px;
    pointer-events: none;
}

#full-width-box-container #term-table {
    transition: height 0.3s ease-in-out;
    width: 100%;
    height: 75%;
    border-radius: 3px;
    padding: 1em;
    margin: 0%;
    padding: 0%;

    display: flex;
    flex-direction: row;
}

#full-width-box-container #term-table.closed {
    height: 0px;
    padding: 0px;
    border: none;
    margin: 0px;
    overflow: hidden;
}

.content-title-wrapper {
    margin-top: 1em;
    display: flex;
    flex-direction: column;
    align-items: start;

    height: 95%;
    border-radius: 3px;

    transition: height 0.3s ease-in-out;
}

.content-title-wrapper.closed {
    height: 0px;
    padding: 0px;
    margin: 0px;
    border: none;
    overflow: hidden;
}

/* Default state: item-selector takes 30%, view-info takes 70% */
.content-title-wrapper.item-selector {
    width: 30%; /* Default width */
    transition: width 0.3s ease-in-out; /* Transition based on flex-basis */
}

.content-title-wrapper.view-info {
    width: 70%; /* Default width */
    min-width: 70%; /* Prevent any minimum width */
    overflow-x: hidden;
    overflow-y: hidden;
    transition:
        width 0.3s ease-in-out,
        min-width 0.3s ease-in-out; /* Transition based on flex-basis */
}

/* When view-info is closed, item-selector should take 100%, and view-info should collapse */
.content-title-wrapper.view-info.closedWidth {
    width: 0px;
    min-width: 0px; /* Prevent any minimum width */
    padding: 0; /* Remove padding */
    margin: 0; /* Remove margin */
    border: none; /* Remove border */
}

.content-title-wrapper.item-selector.fullWidth {
    width: 100%; /* Full width */
    transition: width 0.3s ease-in-out;
}

#process-btn-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
}

.process-btn {
    width: 40%;
    min-width: 45px;
    font-size: 0.8rem;

    margin: 5px 2.5% 0px 2.5%;
    height: 30px;
    border: none;
    border-radius: 3px;
    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);

    background-color: #0071bd;
    color: white;

    text-align: center;
}
.process-btn:hover {
    background-color: rgb(0, 113, 189, 0.8);
}
.process-btn:active {
    background-color: rgba(4, 83, 136);
}
.process-btn:disabled {
    background-color: rgba(0, 0, 0, 0.2);
    cursor: not-allowed;
}

#loading-overlay.hidden {
    display: none;
}

#loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;

    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
}

#loading-overlay p {
    font-size: 1.5em;
    font-weight: bolder;

    padding: 1em;
    border-radius: 50%;
    width: 150px;
    height: 150px;
    background-color: rgba(183, 205, 228, 0.8);
    z-index: 101;
    text-align: center;
}

#spinner-container {
    width: 150px;
    height: 150px;
    position: relative;
    box-sizing: border-box;
}

#spinner {
    animation: spin 1.25s infinite ease-in-out;
    position: absolute;
    top: 0px;
    left: -20px;
    z-index: 100;
    box-sizing: border-box;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    50% {
        transform: rotate(180deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
