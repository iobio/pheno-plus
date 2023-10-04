<template>
    <div v-if="encounter" id="view-info" class="sub-container">
        <textarea
            @change="textChanged"
            @input="textChanged"
            id="encounter-info" 
            type="text" 
            v-model="textInputText"></textarea>
    </div>

    <div class="sub-container" v-if="!encounter" id="view-info">
        <p id="encounter-info-p">No encounter selected.</p>
    </div>

</template>

<script>
    export default {
        name: 'ViewInfo',
        emits: ['textChanged'],
        props: {
            encounter: Object,
        },
        data () {
            return {
                textInputText: '',
            }
        }, 
        async mounted () {
        },
        methods: {
            textChanged() {
                this.$emit('textChanged', this.textInputText);
            }, 
            setText() {
                if (!this.encounter) {
                    return;
                }
                for (let item in this.encounter) {
                    this.textInputText += item + ': ' + this.encounter[item] + '\n';
                }
                //this.textInputText = this.encounter.date + '\n' + this.encounter.text 
            }
        },
        computed: {
        }, 
        watch: {
            encounter: function (newVal, oldVal) {
                this.setText();
                this.textChanged();
            }
        }
    }

</script>

<style scoped lang="css">
    #encounter-info {
        width: 100%;
        height: 100%;
        resize: none;
        overflow: auto;
        font-size: 1em;
        font-family: 'Open Sans', sans-serif;

        border: rgb(215, 215, 215) 1px solid;
        border-radius: 3px;
        padding: .5em; 
        background-color: white;
    }

    #encounter-info-p {
        width: 100%;
        height: 100%;
        font-size: 1em;
        margin-top: 0%;

        border: rgb(215, 215, 215) 1px solid;
        border-radius: 3px;
        padding: .5em; 
        background-color: white;
    }

</style>