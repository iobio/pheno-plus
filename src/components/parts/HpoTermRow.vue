<template>
    <div
        class="hpo-row-container"
        :class="[
            this.thisHpoItemObj.use ? '' : 'disabled',
            { base: baseInformationOnly },
            { selected: selectedTerm == hpoItemObj },
        ]"
    >
        <span
            class="phenotype-name-span"
            @mouseover="showHpoIdSpan($event)"
            @mouseleave="hideHpoIdSpan($event)"
            @click="$emit('selectTerm', thisHpoItemObj)"
        >
            <i class="small-italic">({{ thisHpoItemObj.getNumOccurrences() }})</i> {{ thisHpoItemObj.getPhenotypeName() }}
            <span class="hpo-id-span">{{ thisHpoItemObj.getHpoId() }}</span>
        </span>

        <span class="delete-btn-span">
            <input type="checkbox" name="use" id="" v-model="thisHpoItemObj.use" @change="updateUse($event)" />
        </span>
        <span v-if="!(selectedTerm == hpoItemObj)" class="show-btn-span" @click="$emit('selectTerm', thisHpoItemObj)"
            ><img class="show-btn-img" alt="show context" src="../../assets/doc-view.svg"
        /></span>
        <span v-if="selectedTerm == hpoItemObj" class="show-btn-span" @click="$emit('selectTerm', thisHpoItemObj)"
            ><img class="show-btn-img" alt="show context" src="../../assets/doc-close.svg"
        /></span>
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
    data() {
        return {
            thisHpoItemObj: this.hpoItemObj,
            severityColor: [],
        };
    },
    mounted() {
        this.setColor();
    },
    methods: {
        deleteFromList() {
            if (this.selectedTerm == this.hpoItemObj) {
                this.$emit('selectTerm', null);
            }
            this.$emit('deleteItem', this.hpoItemObj.getHpoId());
        },
        updateUse(event) {
            this.$emit('updateItem', event, this.hpoItemObj);
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
        showHpoIdSpan(event) {
            //takes this event and shows the hpo id span with the current phenotype-name-span
            //this is a hover event
            let idspan = event.target.querySelector('.hpo-id-span');
            if (idspan) {
                idspan.style.visibility = 'visible';
            }
        },
        hideHpoIdSpan(event) {
            //takes this event and hides the hpo id span with the current phenotype-name-span
            //this is a hover event
            let idspan = event.target.querySelector('.hpo-id-span');
            if (idspan) {
                idspan.style.visibility = 'hidden';
            }
        },
    },
    watch: {
        hpoItemObj: function (newVal, oldVal) {
            this.thisHpoItemObj = newVal;
            this.setColor();
        },
    },
};
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

input[type='checkbox'] {
    cursor: pointer;
}

.hpo-row-container {
    width: 100%;
    display: grid;
    grid-template-columns: 0.7fr 0.15fr 0.15fr;
    justify-items: center;
    align-items: center;

    padding: 0.25em;
}
.hpo-row-container.base > :first-child {
    justify-self: start;
}
.hpo-row-container.base {
    grid-template-columns: 0.7fr 0.15fr 0.15fr;
}
.hpo-row-container:hover {
    background-color: #e2e2e2;
}
.hpo-row-container.disabled {
    opacity: 0.5;
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
    align-items: center;
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
.phenotype-name-span {
    position: relative;
    cursor: pointer;
    width: 100%;
}
.hpo-id-span {
    position: absolute;
    visibility: hidden;
    background-color: gray;
    color: white;
    opacity: 0.8;
    font-style: italic;
    border-radius: 3px;
    padding: 2px 5px;
    z-index: 1;
    transform: translate(5px, -2px);
}
</style>
