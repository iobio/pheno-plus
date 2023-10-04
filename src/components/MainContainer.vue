<template>
  <div id="the-main-container">
    <div id="loading-overlay" :class="{ hidden: hideOverlay}">
      <p>Loading <br> HPO <br> Terms...</p>
    </div>
    <div id="selector-view-container">
      <div class="content-title-wrapper item-selector">
        <h3>EHR Note List ({{ encountersNum }})</h3>
        <ItemSelector class="sub-container" 
        :encountersList="encountersList"
        :selectedEncounter="selectedEncounter"
        :alreadyProcessed="itemsAlreadyProcessed"
        @selectEncounter="selectEncounter">
        </ItemSelector>
      </div>


      <div class="content-title-wrapper view-info">
        <h3>Selected Note Content</h3>
        <ViewInfo
        :encounter="selectedEncounter"
        @textChanged="changeTextContent">
        </ViewInfo>
        <button id="process-btn" @click="processText">Process Into HPO Terms</button>
      </div>
    </div>

    <div id="full-width-box-container">
      <TermDashboard
        :hpoItemsObj="hpoItemsObj"
        @removeItem="removeItem"
        @updateItem="updateItem"
        @sendTerms="formatAndPopulateTerms"
        @clearTableTerms="clearAllTableTerms">
      </TermDashboard>
      <ClipBoardBox
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
  import fetchFromGru from '../fetchFromGru'
  import ChartItem from '../models/ChartItem.js'

  export default {
    name: 'MainContainer',
    components: {
      ViewInfo,
      ItemSelector,
      TermDashboard,
      ClipBoardBox,
    },
    props: {
      encountersList: Array,
      encountersNum: Number,
      notesList: Array,
      notesNum: Number,
      theClient: Object,
    },
    data () {
      return {
        selectedEncounter: null,
        selectedItemTextContent: null,
        itemsAlreadyProcessed: [],
        hpoItemsObj: {},
        clipTerms: [],
        hideOverlay: true,
      }
    }, 
    async mounted () {
    },
    methods: {
      selectEncounter (encounter) {
        this.selectedEncounter = encounter;
      },
      removeItem (id) {
        delete this.hpoItemsObj[id];
      },
      updateItem (item) {
        this.hpoItemsObj[item.getHpoId()] = item;
      },
      formatAndPopulateTerms () {
        //Needs to populate the clipboard box with the terms
        let terms = [];
        for (let key in this.hpoItemsObj) {
          let item = this.hpoItemsObj[key];
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
        this.hpoItemsObj = {};
      },
      async processText () {
        //If nothing is selected dont process
        if (this.selectedEncounter === null) {
          return;
        }

        //If the item has already been processed dont add it to the list again
        if (!this.itemsAlreadyProcessed.includes(this.selectedEncounter.id)) {
          this.itemsAlreadyProcessed.push(this.selectedEncounter.id);
        }

        //Show the loading overlay
        this.hideOverlay = false;
        let gru_data = await fetchFromGru(this.selectedItemTextContent);
        let clinPhen = gru_data.clinPhenData;

        //for each item in the clinPhen object create a new result item and add to the hpoItemsObj
        for (let key in clinPhen) {
          let item = new ChartItem(clinPhen[key]);
          this.hpoItemsObj[key] = item;
        }
        this.hideOverlay = true;
      }, 
      changeTextContent (textContent) {
        this.selectedItemTextContent = textContent;
      }
    },
  }
</script>

<style lang="css">
  h3 {
    width: 100%;
    border-radius: 3px 3px 0px 0px;
    margin-top: 0px;
    margin-bottom: 0px;
  }

  #num-encounters {
    font-size: 20px;
    font-weight: bold;
    margin-left: 20px;
    margin-top: 20px;
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

  .content-title-wrapper .sub-container {
    width: 100%;

    margin-top: 0px;
    overflow-y: auto;
    box-sizing: border-box;

    padding: 10px;

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

  #process-btn {
    width: 95%;
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
  #process-btn:hover {
    background-color: rgb(0,113,189, .8);
  }
  #process-btn:active {
    background-color: rgba(4, 83, 136);
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