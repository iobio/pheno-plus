<template>
    <div v-if="this.$userNotAuthorized" id="alt-msg">
      <span>This app is available to specific users only. For inquiries and access, please contact Emerson Lebleu at <b>emerson.lebleu@genetics.utah.edu</b> and members of the ReImagine EHR team at <b>ReImagineEHR@utah.edu</b></span>
    </div>
    <MainContainer v-else
      :notesList="notesList" 
      :notesNum="notesNum"
      :hideOverlayFromApp="hideOverlay">
    </MainContainer>
</template>

<script>
  import MainContainer from '@/components/MainContainer.vue';
  import constructData from './data/constructData';
  import fetchNotes from './data/fetchNotes';

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
        hideOverlay: true,
      }
    }, 
    async mounted () {
      //Demo Data setup
      let list2 = constructData();

      if (this.$userNotAuthorized == true) {
        //If the user is not authorized, do not load any data
        return;
      }

      this.hideOverlay = false;
      //Fetch the notes from the server
      const appNotesObj = await fetchNotes(this.$client, this.$patientId);
      const appNotes = appNotesObj.notesList;
      this.$totalNotes = appNotesObj.totalNotes;

      this.hideOverlay = true;

      if (appNotes != null && appNotes.length != 0) {
        this.notesList = appNotes;
        this.notesNum = appNotes.length;

      } else if (this.$isTestingEnvironment == true) {
        //Load demo data because we are in testing
        this.notesList = this.notesList.concat(list2);

      } else { //if we are not in testing and there are no notes
        //Notes List is empty
        this.notesList = [];
      }
    },
    methods: {
    }
  }
</script>

<style lang="css">
  #alt-msg {
    width: 100%;
    height: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  #alt-msg span {
    width: 50%;
  }

</style>
