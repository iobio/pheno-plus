<template>
    <MainContainer
      :notesList="notesList" 
      :notesNum="notesNum">
    </MainContainer>
</template>

<script>
  import MainContainer from '@/components/MainContainer.vue';
  import constructData from './data/constructData';

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
      //Demo Data setup
      let list2 = constructData();
      
      if (this.$notesListGlobal != null && this.$notesListGlobal.length != 0) {

        //If there is data in the global notes list, use it
        this.notesList = this.$notesListGlobal;

        //Combine with the demo data
        this.notesList = this.notesList.concat(list2);

        //Set the number of notes
        this.notesNum = this.notesList.length;

      } else { //if there isnt any data in the global notes list just load demo data

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
