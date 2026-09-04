<template>
    <div v-if="!this.$userHasAccess" id="alt-msg">
      <span>Pheno+ is not yet available to your account. For inquiries and access, please contact Emerson Lebleu at <b>emerson.lebleu@genetics.utah.edu</b> and members of the ReImagine EHR team at <b>ReImagineEHR@utah.edu</b></span>
    </div>
    <MainContainer v-else
      :notesList="notesList" 
      :notesNum="notesNum"
      :hideOverlayFromApp="hideOverlay"
      :totalNotes="totalNotes">
    </MainContainer>
</template>

<script>
  import MainContainer from '@/components/MainContainer.vue';
  import fetchNotes from './data/fetchNotes';
  import { resolveMockNotesOverride } from './data/mockNotes.js';

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
        totalNotes: 0,
      }
    }, 
    async mounted () {
      if (this.$userHasAccess != true) {
        return;
      }

      const deploymentConfig = this.$deploymentConfig || {};
      const notesOverride = resolveMockNotesOverride(deploymentConfig);

      this.hideOverlay = false;
      const appNotesObj = await fetchNotes(this.$client, this.$patientId, notesOverride);
      const appNotes = appNotesObj.notesList;
      this.totalNotes = appNotesObj.totalNotes;

      this.hideOverlay = true;

      if (appNotes != null && appNotes.length != 0) {
        this.notesList = appNotes;
        this.notesNum = appNotes.length;
      } else {
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
