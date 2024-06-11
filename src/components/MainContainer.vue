<template>
  <div id="the-main-container">
    <div id="loading-overlay" :class="{ hidden: hideOverlay}">
      <div id="spinner-container">
        <svg id="spinner" width="195" height="195" viewBox="-4 -4 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 50,6 A 50,50 0 0,1 85.36,35.36" fill="none" stroke="#1B5590" stroke-width="9"/>
        </svg>
        <p v-if="hideOverlayFromApp">Loading <br> HPO <br> Terms...</p>
        <p v-else>Pulling <br> Notes <br> ...</p>        
      </div>
    </div>
    <div id="selector-view-container" :class="{closed: !selectorViewOpen}">
      <div class="open-close" @click="selectorViewOpen = !selectorViewOpen">
        <img v-if="selectorViewOpen" src="../assets/close.svg" alt="close section">
        <img v-else src="../assets/dots-hz.svg" alt="open section">
        <div class="open-close-label">{{ selectorViewOpen ? 'Close Notes Section' : 'Open Notes Section'}}</div>
      </div>
      <div class="content-title-wrapper item-selector" :class="{closed: !selectorViewOpen}">
        <h3 @mouseenter="showNotesPulledTip = true" @mouseleave="showNotesPulledTip = false" id="item-selector-header">Relevant EHR Notes ({{ notesNum }})
        </h3>
        <ItemSelector class="sub-container" 
        :notesList="notesList"
        :selectedNote="selectedNote"
        :alreadyProcessed="notesAlreadyProcessed"
        :isCheckedMap="isCheckedMap"
        :allChecked="allChecked"
        @selectNote="selectNote"
        @updateIsCheckedMap="updateIsCheckedMap"
        @uncheckAll="uncheckAll"
        @checkAll="checkAll">
        </ItemSelector>
        <button class="process-btn all" @click="processTextAll" :disabled="checkForChecked() || allNotesProcessed">Process Selected Notes</button> 
      </div>

      <div class="open-close note-preview" @click="noteContentOpen = !noteContentOpen">
        <div class="open-close-label">{{ noteContentOpen ? 'Close Note Preview' : 'Open Note Preview'}}</div>
        <img v-if="noteContentOpen" src="../assets/close.svg" alt="close section">
        <img v-else src="../assets/dots-hz.svg" alt="open section">
      </div>
      <div class="content-title-wrapper view-info" :class="{closed: !selectorViewOpen, closedWidth: !noteContentOpen}">
        <h3>Note Content Preview</h3>
        <ViewInfo
        :note="selectedNote"
        @textChanged="changeTextContent">
        </ViewInfo>
      </div>
    </div>

    <div id="full-width-box-container" :class="{closed: !fullWidthBoxOpen}">
      <div class="open-close" @click="fullWidthBoxOpen = !fullWidthBoxOpen">
        <img v-if="fullWidthBoxOpen" src="../assets/close.svg" alt="close section">
        <img v-else src="../assets/dots-hz.svg" alt="open section">
        <div class="open-close-label">{{ fullWidthBoxOpen ? 'Close HPO Terms Section' : 'Open HPO Terms Section'}}</div>
      </div>
      <div id="term-table" :class="{closed: !fullWidthBoxOpen}">
        <TermDashboard
          :hpoItemsObj="hpoTermsObj"
          :sortedHpoList="sortedHpoList"
          :baseInformationOnly="baseInformationOnly"
          :selectedTerm="selectedTerm"
          @removeItem="removeHpoTerm"
          @updateItem="updateHpoTerm"
          @sendTerms="formatAndPopulateTerms"
          @clearTableTerms="clearAllTableTerms"
          @selectTerm="selectTerm">
        </TermDashboard>
        <TermPeek
          :hpoItemObj="selectedTerm"></TermPeek>
      </div>
      <ClipBoardBox
        :class="{closed: !fullWidthBoxOpen}"
        :clipBoardTerms="clipTerms"
        @clearClipboardTerms="clearClipTerms"></ClipBoardBox>
    </div>
  </div>

</template>

<script>
  import ViewInfo from './parts/ViewInfo.vue'
  import ItemSelector from './parts/ItemSelector.vue'
  import TermDashboard from './parts/TermDashboard.vue'
  import ClipBoardBox from './parts/ClipBoardBox.vue'
  import fetchFromGru from '../data/fetchFromGru'
  import ChartItem from '../models/ChartItem.js'
  import TermPeek from './parts/TermPeek.vue'

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
      totalNotes: Number
    },
    data () {
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
        fullWidthBoxOpen: false
      }
    }, 
    async mounted () {
    },
    methods: {
      selectTerm (term) {
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
        this.selectedNote = note;
      },
      removeHpoTerm(id) {
        if (this.selectedTerm !== null && this.selectedTerm.hpoId === id) {
          this.selectedTerm = null;
        }
        this.sortedHpoList = this.sortedHpoList.filter(item => item[0] !== id);
        delete this.hpoTermsObj[id];
      },
      updateHpoTerm(item) {
        this.hpoTermsObj[item.getHpoId()] = item;
      },
      formatAndPopulateTerms() {
        //Needs to populate the clipboard box with the terms
        let terms = [];
        for (let key in this.hpoTermsObj) {
          let item = this.hpoTermsObj[key];
          if (item.getUse()) {
            terms.push(item.getHpoId());
          }
        }
        this.clipTerms = terms;
      },
      clearClipTerms () {
        this.clipTerms = [];
      },
      clearAllTableTerms () {
        this.hpoTermsObj = {};
        this.sortedHpoList = [];
        this.notesAlreadyProcessed = [];
        this.selectedTerm = null;
      },
      async processText () {
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
          var clinPhen = gru_data.clinPhenData;

          //for each item in the clinPhen object create a new result item and add to the hpoItemsObj
          for (let key in clinPhen) {
            if (this.hpoTermsObj[key]) {
              let alreadyExists = false;
              for (let sentence of this.hpoTermsObj[key].exampleSentence) {
                if (sentence == clinPhen[key]["Example sentence"]) {
                  alreadyExists = true;
                }
              }

              if (!alreadyExists){
                //If it already exists add the new instance factors to the item
                this.hpoTermsObj[key].addToNumOccurrences(clinPhen[key]["No. occurrences"])
                this.hpoTermsObj[key].addToEarliness(clinPhen[key]["Earliness (lower = earlier)"])
                this.hpoTermsObj[key].addToExampleSentence(clinPhen[key]["Example sentence"])
                continue;
              }
              continue;
            }
            //otherwise just add it to the list we haven't seen it before
            let item = new ChartItem(clinPhen[key]);
            this.hpoTermsObj[key] = item;
          }
          let sortedTerms = Object.values(this.hpoTermsObj)
            .sort((a, b) => b.numOccurrences - a.numOccurrences)
            .map(item => [item.hpoId, item.numOccurrences]);

          this.sortedHpoList = sortedTerms;
          this.hideOverlay = true;
          this.selectorViewOpen = false;
        } else {
          this.hideOverlay = true;
          this.selectorViewOpen = false;
        }

      },
      async processTextAll(){
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
      changeTextContent (textContent) {
        this.selectedNoteTextContent = textContent;
      },
      updateIsCheckedMap (noteId) {
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
      }
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
      }
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
    }
  }
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
  }

  #selector-view-container, #full-width-box-container {
    border: 1px solid transparent;
    border-radius: 5px;
    transition: flex-grow 0.3s ease-in-out, border 0.4s ease-in-out;
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
    color:#0071bd; 
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
    color:#0071bd; 
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

  #selector-view-container .open-close-label, #full-width-box-container .open-close-label {
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

  .content-title-wrapper .sub-container {
    width: 100%;

    margin-top: 0px;
    overflow-y: auto;
    box-sizing: border-box;

    padding: 0px 10px 10px 10px;

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

  .content-title-wrapper.item-selector {
    flex: 1 1 45%;
  }

  .content-title-wrapper.item-selector .sub-container {
    box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    border-radius: 3px;
  }
  .content-title-wrapper.view-info {
    width: 56%;
    transition: width 0.3s ease-in-out;
  }

  .content-title-wrapper.view-info.closedWidth {
    width: 0px;
    padding: 0px;
    margin: 0px;
    border: none;
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
    font-size: .8rem;

    margin: 5px 2.5% 0px 2.5%;
    height: 30px;
    border: none;
    border-radius: 3px;
    box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);

    background-color: #0071bd;
    color: white;

    text-align: center;
  }
  .process-btn:hover {
    background-color: rgb(0,113,189, .8);
  }
  .process-btn:active {
    background-color: rgba(4, 83, 136);
  }
  .process-btn:disabled {
    background-color: rgba(0, 0, 0, 0.2);
    cursor: not-allowed;
  }
  #view-info.sub-container {
    overflow-y: hidden;
    height: 100%;
    padding-top: 0px;
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

    background-color: rgba(255, 255, 255, .5);
    display: flex;
    justify-content: center;
    align-items: center;
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
  }

  #spinner {
    animation: spin 1.25s infinite ease-in-out;
    position: absolute;
    top: 0px;
    left: -20px;
    z-index: 100;
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