<template>
    <div id="term-dashboard-container">
        <h4 id="title-row">
            <span>Severity</span>
            <span>Phenotype / Disorder</span>
            <span>HPO Term</span>
            <span>Inheritance</span>
            <span>Mother</span>
            <span>Father</span>
            <span>Use</span>
            <span></span>
        </h4>
        <div v-if="Object.keys(hpoItemsObj).length > 0" id="table-container">
            <HpoTermRow
                v-for="hpoItem in hpoItemsObj"
                :hpoItemObj="hpoItem"
                @deleteItem="removeItem"
                @updateItem="updateItem"></HpoTermRow>
        </div>
        <div v-else id="table-container">
            <span>No terms to show.</span>
        </div>
    </div>

</template>

<script>
    import HpoTermRow from './HpoTermRow.vue';

    export default {
        name: 'TermDashboard',
        components: {
            HpoTermRow,
        },
        props: {
            hpoItemsObj: Object,
        },
        data () {
            return {
                termDashHpoItemsObj: this.hpoItemsObj,
            }
        }, 
        async mounted () {
        },
        methods: {
            removeItem (id) {
                this.$emit('removeItem', id);
            },
            updateItem (item) {
                this.$emit('updateItem', item);
            },
        }, 
        watch: {
            hpoItemsObj: {
                handler: function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        this.termDashHpoItemsObj = newVal;
                    }
                },
                deep: true,
        }
    }
}

</script>

<style>
    #term-dashboard-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        width: 100%;
        height: 60%;
        border-radius: 3px;
        padding: 1em;
        
        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);
    }

    #table-container {
        width: 100%;
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        height: auto;
        flex: 1;
    }

    #title-row {
        width: 100%;
        display: grid;
        grid-template-columns: .75fr 1.5fr 1fr 1fr .5fr .5fr .25fr .25fr;
        justify-items: start;

        margin-top: 0px;
        margin-bottom: 5px;
        color: rgb(0,113,189);
        padding-left: .25em;
        padding-right: 16px;
    }

</style>