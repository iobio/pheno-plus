<template>
    <MainContainer
      :encountersList="notesList" 
      :encountersNum="notesNum">
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
        notesList: [],
        notesNum: 0,
        testInformation: null,
        theClient: null,
      }
    }, 
    async mounted () {
      //Demo Data
      let list2 = constructData();
      //Check to see if the notes list contains anything
      if (this.$notesListGlobal != null && this.$notesListGlobal.length != 0) {
        this.notesList = this.$notesListGlobal;
        //Combine with the demo data
        this.notesList = this.notesList.concat(list2);
        //Set the number of notes
        this.notesNum = this.notesList.length;
      } else {
        //Just demo data will be loaded
        this.notesList = this.notesList.concat(list2);
      }
    },
    methods: {
    }
  }
</script>

<style lang="css">

</style>
