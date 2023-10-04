<template>
    <MainContainer
      :encountersList="encountersList" 
      :encountersNum="encountersNum"
      :notesList="notesList"
      :notesNum="notesNum"
      :theClient="theClient">
    </MainContainer>
</template>

<script>
  import MainContainer from '@/components/MainContainer.vue';
  import constructData from './constructData';

  export default {
    name: 'App',
    components: {
      MainContainer
    },
    data () {
      return {
        encountersList: [],
        encountersNum: 0,
        notesList: [],
        notesNum: 0,
        testInformation: null,
        theClient: null,
      }
    }, 
    async mounted () {
      let list2 = constructData();

      if (this.$notesListGlobal != 0 && this.$notesListGlobal.length != 0) {
        //Encounters
        this.encountersList = this.$notesListGlobal;
        this.encountersNum = this.$notesNumGlobal;
      } else {
        //Encounters
        this.encountersList = this.$encountersListGlobal;
        this.encountersNum = this.$encountersNumGlobal;
      }

      //Notes
      // this.notesList = this.$notesListGlobal;
      // this.notesNum = this.$notesNumGlobal;

      this.theClient = this.$fhirClientGlobal;

      //Combine with the demo data
      this.encountersList = this.encountersList.concat(list2);
      this.notesList = this.notesList.concat(list2);
    },
    methods: {
    }
  }
</script>

<style lang="css">

</style>
