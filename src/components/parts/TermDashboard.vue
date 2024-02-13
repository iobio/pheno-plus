<template>
    <div id="term-dashboard-container">
        <h4 id="title-row" :class="{ base: baseInformationOnly}">
            <span v-if="baseInformationOnly"></span>
            <span v-if="!baseInformationOnly">Severity</span>
            <span><i class="small-italic">(Unique Occ.)</i> Phenotype</span>
            <span>HPO Term</span>
            <span v-if="!baseInformationOnly">Inheritance</span>
            <span v-if="!baseInformationOnly">Mother</span>
            <span v-if="!baseInformationOnly">Father</span>
            <span>Relevant</span>
            <span></span>
        </h4>
        <div v-if="sortedHpoList.length > 0" id="table-container">
            <HpoTermRow
                v-for="hpoPair in sortedHpoList"
                :hpoItemObj="hpoItemsObj[hpoPair[0]]"
                :baseInformationOnly="baseInformationOnly"
                :selectedTerm="selectedTerm"
                @deleteItem="removeItem"
                @updateItem="updateItem"
                @selectTerm="handleTermSelected"></HpoTermRow>
        </div>

        <!-- only if there is no content to be rendered yet -->
        <div v-else id="table-container">
            <span id="no-terms-alt-msg">No terms to show. Process notes to populate terms.</span>
        </div>

        <div id="send-terms-btn-container">
            <!-- <button id="send-terms-btn" @click="this.$emit('sendTerms')">Send Terms</button> -->
            <button id="clear-terms-btn" @click="this.$emit('clearTableTerms')">Clear Terms</button>
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
            sortedHpoList: Array,
            baseInformationOnly: Boolean,
            selectedTerm: Object,
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
                this.$emit('sendTerms');
            },
            handleTermSelected(term) {
                this.$emit('selectTerm', term);
            }
        }, 
        watch: {
            hpoItemsObj: {
                handler: function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        this.termDashHpoItemsObj = newVal;
                    }
                },
                deep: true,
        },
        sortedHpoList: {
            handler: function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.$emit('sendTerms')
                }
            },
            deep: true,
        },
    }
}

</script>

<style>
    #no-terms-alt-msg {
        padding-top: 10px;
    }
    #send-terms-btn-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;

        margin-top: 10px;
    }

    #send-terms-btn {
        width: 20%;
        font-size: .8rem;

        height: 30px;
        border: none;
        border-radius: 3px;
        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);

        background-color: rgb(0,113,189);
        color: white;

        text-align: center;
    }
    #send-terms-btn:hover {
        background-color: rgb(0,113,189, .8);
    }
    #send-terms-btn:active {
    background-color: rgba(4, 83, 136);
    }

    #clear-terms-btn {
        width: 10%;
        font-size: .8rem;

        height: 30px;
        border: none;
        border-radius: 3px;
        box-shadow: 0 3px 1px -2px rgba(79, 79, 79, 0.2), 0 2px 2px 0 rgba(79, 79, 79, 0.2), 0 1px 5px 0 rgba(79, 79, 79, 0.2);

        background-color: rgb(0,113,189);
        color: white;

        text-align: center;
        margin-left: 3px;
    }
    #clear-terms-btn:hover {
        background-color: rgb(0,113,189, .8);
    }
    #clear-terms-btn:active {
    background-color: rgba(4, 83, 136);
    }

    #term-dashboard-container {
        background-color: white;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        flex-grow: 1;
        height: 100%;
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
        margin-top: 10px;
        border-radius: 3px;

        border: rgb(215, 215, 215) 1px solid;
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

    #title-row.base {
        grid-template-columns: .25fr 1.75fr 1.5fr .25fr .25fr;
    }

</style>