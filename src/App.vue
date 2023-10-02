<template>
    <MainContainer
      :encountersList="encountersList" 
      :encountersNum="encountersNum">
    </MainContainer>
</template>

<script>
  import Encounter from '@/models/Encounter';
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
        testInformation: null,
      }
    }, 
    async mounted () {
      await this.getInfo();
      let list2 = constructData();
      this.encountersList = this.encountersList.concat(list2);
    },
    methods: {
      async getInfo () {
        FHIR.oauth2.ready().then((client) => {
          // Get encounters for the selected patient
          client.request("/Encounter?patient=" + client.patient.id)
          // Reject if no encounters are found
          .then(function(data) {
              if (!data.entry || !data.entry.length) {
                  throw new Error("No encounters found for the selected patient");
              }
              this.testInformation = data.entry;
              return data.entry;
          })
          // Set the list of encounters & the number of encounters
          .then(
              (encounters) => {
                  this.encountersNum = encounters.length;

                  for (let encounter of encounters) {
                      var id = encounter.resource.id;
                      var encType = null;
                      var reason = null;
                      var start = null;
                      var end = null;

                      //Make sure the encounter has the required fields if not note that
                      if (encounter.resource.type && encounter.resource.type[0] && encounter.resource.type[0].text) {
                          encType = encounter.resource.type[0].text;
                      } else {
                          encType = "No type found.";
                      }

                      if (encounter.resource.reasonCode && encounter.resource.reasonCode[0].coding[0].display) {
                          reason = encounter.resource.reasonCode[0].coding[0].display;
                      } else {
                          reason = "No reason found.";
                      }

                      if (encounter.resource.period.start) {
                          start = encounter.resource.period.start;
                      } else {
                          start = "No start date found.";
                      }

                      if (encounter.resource.period.end) {
                          end = encounter.resource.period.end;
                      } else {
                          end = "No end date found.";
                      }

                    //Create the encounter object
                    var encounterObj = new Encounter(id, encType, reason, start, end);
                    //Add the encounter to the list of encounters
                    this.encountersList.push(encounterObj);
                  };
              },
              (error) => {
                  console.log(error.stack);
              }
          );
        }).catch(console.error);
      }
    }
  }
</script>

<style lang="css">

</style>
