<template>
  <div id="the-main-container">
    <div id="selector-view-container">
      <div class="content-title-wrapper">
        <h3>Item List ({{ encountersNum }})</h3>
        <ItemSelector class="sub-container" 
        :encountersList="encountersList"
        :selectedEncounter="selectedEncounter"
        :alreadyProcessed="itemsAlreadyProcessed"
        @selectEncounter="selectEncounter">
        </ItemSelector>
      </div>


      <div class="content-title-wrapper">
        <h3>Selected Item Content</h3>
        <ViewInfo
        :encounter="selectedEncounter"
        @textChanged="changeTextContent">
        </ViewInfo>
      </div>

      <div id="process-btn-container">
        <button id="process-btn" @click="processText">Process</button>
      </div>
    </div>

    <div id="full-width-box-container">
      <TermDashboard></TermDashboard>
      <ClipBoardBox></ClipBoardBox>
    </div>
  </div>

</template>

<script>
  import ViewInfo from './parts/ViewInfo.vue'
  import ItemSelector from './parts/ItemSelector.vue'
  import TermDashboard from './parts/TermDashboard.vue'
  import ClipBoardBox from './parts/ClipBoardBox.vue'

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
    },
    data () {
      return {
        selectedEncounter: null,
        selectedItemTextContent: null,
        itemsAlreadyProcessed: [],
      }
    }, 
    async mounted () {
    },
    methods: {
      selectEncounter (encounter) {
        this.selectedEncounter = encounter;
      },
      processText () {
        //If nothing is selected dont process
        if (this.selectedEncounter === null) {
          return;
        }

        //If the item has already been processed dont add it to the list again
        if (!this.itemsAlreadyProcessed.includes(this.selectedEncounter.id)) {
          this.itemsAlreadyProcessed.push(this.selectedEncounter.id);
        }

        //TODO: Send this text to the phenotype thing and get the response into the term dashboard
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
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #selector-view-container {
    width: 85%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex: 1;

  }

  #full-width-box-container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    flex: 2;
    width: 85%;
  }

  .content-title-wrapper .sub-container {
    width: 100%;

    margin-top: 0px;
    overflow-y: auto;
    box-sizing: border-box;
    height: 300px;
    padding: 10px;
  }

  .content-title-wrapper {
    margin-top: 1em;
    width: 45%;
    display: flex;
    flex-direction: column;
    align-items: start;
    border-radius: 3px;

    box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
  }

  #process-btn-container {
    display: flex;
    margin-bottom: 20px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 8%;
    min-width: 45px;
  }

  #process-btn {
    width: 100%;
    min-width: 45px;
    font-size: .8rem;

    margin-right: 0px;
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

  #view-info.sub-container {
    overflow-y: hidden;
  }

</style>