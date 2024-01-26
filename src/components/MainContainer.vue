<template>
  <div id="the-main-container">
    <div id="loading-overlay" :class="{ hidden: hideOverlay}">
      <p v-if="hideOverlayFromApp">Loading <br> HPO <br> Terms...</p>
      <p v-else>Pulling <br> Notes <br> ...</p>
    </div>
    <div id="selector-view-container">
      <div class="content-title-wrapper item-selector">
        <h3>EHR Note List ({{ notesNum }})</h3>
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
      </div>


      <div class="content-title-wrapper view-info">
        <h3>Selected Note Content</h3>
        <ViewInfo
        :note="selectedNote"
        @textChanged="changeTextContent">
        </ViewInfo>
        <div id="process-btn-container">
          <button class="process-btn" @click="processText">Process Selected Note</button>
          <button class="process-btn all" @click="processTextAll" :disabled="checkForChecked()">Process All Checked</button>
        </div>
      </div>
    </div>

    <div id="full-width-box-container">
      <div id="term-table">
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
        :clipBoardTerms="clipTerms"
        @clearClipboardTerms="clearClipTerms"></ClipBoardBox>
    </div>
  </div>

</template>

<script>
  import NoteSelectPane from './parts/NoteSelectPane.vue'
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
      NoteSelectPane,
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
    },
    data () {
      return {
        selectedNote: null,
        selectedNoteTextContent: null,
        notesAlreadyProcessed: [],
        hpoTermsObj: {},
        clipTerms: [],
        hideOverlay: this.hideOverlayFromApp,
        baseInformationOnly: true,
        sortedHpoList: [],
        selectedTerm: null,
        allChecked: true,
        isCheckedMap: this.isCheckedMapStart || {},
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
      selectNote (note) {
        this.selectedNote = note;
      },
      removeHpoTerm (id) {
        if (this.selectedTerm !== null && this.selectedTerm.hpoId === id) {
          this.selectedTerm = null;
        }
        this.sortedHpoList = this.sortedHpoList.filter(item => item[0] !== id);
        delete this.hpoTermsObj[id];
      },
      updateHpoTerm (item) {
        this.hpoTermsObj[item.getHpoId()] = item;
      },
      formatAndPopulateTerms () {
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
        }

        //Show the loading overlay
        this.hideOverlay = false;
        let gru_data = await fetchFromGru(this.selectedNoteTextContent);

        if (gru_data) {
          var clinPhen = gru_data.clinPhenData;

          //for each item in the clinPhen object create a new result item and add to the hpoItemsObj
          for (let key in clinPhen) {
            if (this.hpoTermsObj[key]) {
              //If it already exists add the new instance factors to the item
              this.hpoTermsObj[key].addToNumOccurrences(clinPhen[key]["No. occurrences"])
              this.hpoTermsObj[key].addToEarliness(clinPhen[key]["Earliness (lower = earlier)"])
              this.hpoTermsObj[key].addToExampleSentence(clinPhen[key]["Example sentence"])
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
        } else {
          this.hideOverlay = true;
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
            map[note.id] = true;
          }
          return map;
      },
    },
    watch: {
      isCheckedMapStart: function (val) {
        this.isCheckedMap = val;
      },
      hideOverlayFromApp: function (val) {
        this.hideOverlay = val;
      }
    }
  }
</script>

<style lang="css">
  .small-italic {
    font-size: small; 
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
    justify-content: space-around;
    align-items: center;
  }

  #selector-view-container {
    width: 93%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 40%;
  }

  #full-width-box-container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    height: 58%;
    width: 93%;
  }

  #full-width-box-container #term-table {
    width: 100%;
    height: 75%;
    border-radius: 3px;
    padding: 1em;
    margin: 0%;
    padding: 0%;

    display: flex;
    flex-direction: row;
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
  }

  .content-title-wrapper.item-selector {
    width: 43%;
  }

  .content-title-wrapper.item-selector .sub-container {
    box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    border-radius: 3px;
  }
  .content-title-wrapper.view-info {
    width: 56%;
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

    background-color: rgb(0,113,189);
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
    height: 80%;
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
    font-weight: bold;

    padding: 1em;
    border-radius: 50%;
    border: gray 1px solid;
    width: 150px;
    height: 150px;

    animation: dimAndBright 1.5s infinite;
    text-align: center;
  }

  @keyframes dimAndBright {
    0% {
      background-color: white;
    }
    50% {
      background-color: rgba(112, 181, 227, 0.9);
    }
    100% {
      background-color: white;
    }
  }

  @keyframes showAndHide {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

</style>