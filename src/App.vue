<template>
    <MainContainer
      :encountersList="encountersList" 
      :encountersNum="encountersNum"
      :testInformation="theClient">
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
        testInformation: null,
        theClient: null,
      }
    }, 
    async mounted () {
      await this.getInfo();
      let list2 = constructData();
      this.encountersList = this.$encounterListGlobal;
      this.encountersNum = this.$encounterNumGlobal;
      this.theClient = this.$fhirClientGlobal;

      this.encountersList = this.encountersList.concat(list2);
    },
    methods: {
      async getInfo () {
        this.testInformation = 'testing...';
      }
    }
  }
</script>

<style lang="css">

</style>
