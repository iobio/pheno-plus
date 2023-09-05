<template>
  <div id="num-encounters">{{ "Number of encounters: " + encountersNum }}</div>
  <div id="selector-view-container">
    <ItemSelector class="sub-container" 
      :encountersList="encountersList"
      @selectEncounter="selectEncounter">
    </ItemSelector>


    <ViewInfo class="sub-container" 
      :encounter="selectedEncounter">
    </ViewInfo>
  </div>


</template>

<script>
  import ViewInfo from './parts/ViewInfo.vue'
  import ItemSelector from './parts/ItemSelector.vue'

  export default {
    name: 'MainContainer',
    components: {
      ViewInfo,
      ItemSelector
    },
    props: {
      encountersList: Array,
      encountersNum: Number,
    },
    data () {
      return {
        selectedEncounter: null,
      }
    }, 
    async mounted () {
    },
    methods: {
      selectEncounter (encounter) {
        this.selectedEncounter = encounter;
      }
    },
  }
</script>

<style lang="css">
  #num-encounters {
    font-size: 20px;
    font-weight: bold;
    margin-left: 20px;
    margin-top: 20px;
  }

  #selector-view-container {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  #selector-view-container .sub-container {
    width: 40%;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 20px;
    margin-bottom: 20px;
    overflow-y: scroll;
    height: 300px;
    padding: 10px;
  }

</style>