<template>
    <div class="hpo-row-container" :class="[this.thisHpoItemObj.use ? '' : 'disabled', {base: baseInformationOnly}, {selected: selectedTerm == hpoItemObj}]">
        <span v-if="baseInformationOnly"></span>
        <span v-if="!baseInformationOnly">
            <select name="severity" id="" v-model="thisHpoItemObj.severity" @change="changeSeverity">
                <option value="mild">mild</option>
                <option value="moderate">moderate</option>
                <option value="severe">severe</option>
                <option value="unknown">unknown</option>
            </select>
            <svg v-if="thisHpoItemObj.severity != 'unknown'" style="height: 12px; width: 12px; margin-left: 3px;" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" :fill="severityColor[0]" :stroke="severityColor[1]"></circle></svg>
        </span>
        <span><i class="small-italic">({{ thisHpoItemObj.getNumOccurrences() }})</i> {{ thisHpoItemObj.getPhenotypeName() }}</span>
        <span>{{ thisHpoItemObj.getHpoId() }}</span>
        <span v-if="!baseInformationOnly">
            <select name="inheritance" id="" v-model="thisHpoItemObj.inheritance" @change="updateItem">
                <option value="unknown">unknown</option>
                <option value="autosomal dominant">autosomal dominant</option>
                <option value="autosomal recessive">autosomal recessive</option>
                <option value="x-linked dominant">x-linked dominant</option>
                <option value="x-linked recessive">x-linked recessive</option>
                <option value="multifactoral">multifactoral</option>
                <option value="mitochondrial">mitochondrial</option>
            </select>
        </span>
        <span v-if="!baseInformationOnly"><input type="checkbox" name="mother" v-model="thisHpoItemObj.mother" @change="updateItem"></span>
        <span v-if="!baseInformationOnly"><input type="checkbox" name="father" v-model="thisHpoItemObj.father" @change="updateItem"></span>
        <span class="delete-btn-span"><input type="checkbox" name="use" id="" v-model="thisHpoItemObj.use" @change="updateItem"></span>
        <span class="delete-btn-span" @click="deleteFromList"><img class="delete-btn-img" alt="remove" src="../../assets/backspace.svg"></span>
        <span v-if="!(selectedTerm == hpoItemObj)" class="show-btn-span" @click="$emit('selectTerm', thisHpoItemObj)"><img class="show-btn-img" alt="show context" src="../../assets/eye-off-outline.svg"></span>
        <span v-if="selectedTerm == hpoItemObj" class="show-btn-span" @click="$emit('selectTerm', thisHpoItemObj)"><img class="show-btn-img" alt="show context" src="../../assets/eye-outline.svg"></span>
    </div>
</template>

<script>
    export default {
        name: 'HpoTermRow',
        props: {
            hpoItemObj: Object,
            baseInformationOnly: Boolean,
            selectedTerm: Object,
        },
        data () {
            return {
                thisHpoItemObj: this.hpoItemObj,
                severityColor: [],
            }
        }, 
        mounted () {
            this.setColor();
        },
        methods: {
            changeSeverity() {
                this.setColor();
                this.updateItem();
            },
            deleteFromList() {
                if (this.selectedTerm == this.hpoItemObj) {
                    this.$emit('selectTerm', null);
                }
                this.$emit('deleteItem', this.hpoItemObj.getHpoId());
            },
            updateItem() {
                this.$emit('updateItem', this.thisHpoItemObj);
            },
            setColor() {
                switch (this.hpoItemObj.getSeverity()) {
                    case 'mild':
                        this.severityColor = ['green', 'none'];
                        break;
                    case 'moderate':
                        this.severityColor = ['orange', 'none'];
                        break;
                    case 'severe':
                        this.severityColor = ['red', 'none'];
                        break;
                    case 'unknown':
                        this.severityColor = ['white', 'black'];
                        break;
                    default:
                        this.severityColor = ['white', 'black'];
                }
            },
        },
        watch: {
            hpoItemObj: function (newVal, oldVal) {
                this.thisHpoItemObj = newVal;
                this.setColor();
            }
        }
    }

</script>

<style lang="css" scoped>
    select {
        border: rgb(209, 209, 209) 1px solid;
        border-radius: 4px;
        padding-top: 2px;
        padding-bottom: 2px;
        cursor: pointer;

        text-align: center;
    }
    .selected {
        background-color: #c2dbf7;
        border-radius: 4px;
    }

    input[type=checkbox] {
        cursor: pointer;
    }

    .hpo-row-container {
        width: 100%;
        display: grid;
        grid-template-columns: .75fr 1.30fr 1fr 1fr .5fr .5fr .25fr .25fr .20fr;
        justify-items: start;
        align-items: center;

        padding: .25em;
    }
    .hpo-row-container.base {
        grid-template-columns: .25fr 1.75fr 1.30fr .25fr .25fr .20fr;
    }
    .hpo-row-container:hover {
        background-color: #e2e2e2;
    }
    .hpo-row-container.disabled {
        opacity: .5;
        color: grey;
        text-decoration: line-through;
    }

    .delete-btn-span {
        display: flex;
        cursor: pointer;
        justify-content: center;
    }
    .show-btn-span {
        display: flex;
        cursor: pointer;
        justify-content: center;
        width: 20px;
        height: 20px;
    }
    .delete-btn-img {
        border-radius: 30%;
        padding-right: 2px;
    }
    .delete-btn-img:hover {
        background-color: #e2e2e2;
    }

</style>