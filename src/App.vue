<template>
    <MainContainer
      :notesList="notesList" 
      :notesNum="notesNum">
    </MainContainer>
</template>

<script>
  import MainContainer from '@/components/MainContainer.vue';
  import constructData from './data/constructData';
  import ClinicalNote from './models/ClinicalNote';

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

      if (this.$isTestingEnvironment == true) {
        let patientId = '1'; //Set this manually to the patient id you want to test
        //get the html document from Documents/Data/Pheno+PHI/patientFolders/patientId
        try {
          var response = await fetch('http://localhost:9111/?patientID=' + patientId);
          var noteObjects = await response.json();
        } catch (error) {
          var noteObjects = [];
        }

        for (let noteObj of noteObjects) {

          //clean the note object text and create a new ClinicalNote object
          var parser = new DOMParser(); //Use the DOMParser to parse the html because the source is the trusted FHIR server

          var doc = parser.parseFromString(noteObj.fileContent, 'text/html');
          var text = doc.body.textContent || "";

          // Clean up the text
          var textClean = text.replace(/[\s\n\r]+/g, ' '); // Replace all new lines with a single new line

          let note = new ClinicalNote(noteObj.fileName, '01/01/1111', 'testEncoutnerID', 'testBinaryURL', noteObj.fileContent);
          this.notesList.push(note);
        }
      }
    },
    methods: {
    }
  }
</script>

<style lang="css">

</style>
