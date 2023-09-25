<template>
    <div class="hpo-row-container" :class="this.thisHpoItemObj.use ? '' : 'disabled'">
        <span>
            <select name="severity" id="" v-model="thisHpoItemObj.severity" @change="changeSeverity">
                <option value="mild">mild</option>
                <option value="moderate">moderate</option>
                <option value="severe">severe</option>
                <option value="unknown">unknown</option>
            </select>
            <svg style="height: 12px; width: 12px;" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" :fill="severityColor[0]" :stroke="severityColor[1]"></circle></svg>
        </span>
        <span>{{ thisHpoItemObj.getPhenotypeName() }}</span>
        <span>{{ thisHpoItemObj.getHpoId() }}</span>
        <span>
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
        <span><input type="checkbox" name="mother" v-model="thisHpoItemObj.mother" @change="updateItem"></span>
        <span><input type="checkbox" name="father" v-model="thisHpoItemObj.father" @change="updateItem"></span>
        <span class="delete-btn-span"><input type="checkbox" name="use" id="" v-model="thisHpoItemObj.use" @change="updateItem"></span>
        <span class="delete-btn-span" @click="deleteFromList"><img class="delete-btn-img" alt="remove" src="../../assets/backspace.svg"></span>
    </div>
</template>

<script>
    export default {
        name: 'HpoTermRow',
        props: {
            hpoItemObj: Object,
        },
        data () {
            return {
                thisHpoItemObj: this.hpoItemObj,
                severityColor: [],
            }
        }, 
        async mounted () {
            this.setColor();
        },
        methods: {
            changeSeverity() {
                this.setColor();
                this.updateItem();
            },
            deleteFromList() {
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
    .hpo-row-container {
        width: 100%;
        display: grid;
        grid-template-columns: .75fr 1.5fr 1fr 1fr .5fr .5fr .25fr .25fr;
        justify-items: start;
        align-items: center;

        padding: .25em;
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
    .delete-btn-img {
        border-radius: 30%;
        padding-right: 2px;
    }
    .delete-btn-img:hover {
        background-color: #e2e2e2;
    }

</style>