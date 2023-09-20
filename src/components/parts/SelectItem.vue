<template>
    <p 
    :class="{'attention': color, 'current-selection' : isSelected}"
    @click="selectEncounter">{{ encounter.id }}
    </p>
</template>

<script>
    export default {
        name: 'SelectItem',
        props: {
            encounter: Object,
            color: Boolean,
            selectedEncounter: Object,
        },
        data () {
            return {
                itemEncounter: this.encounter,
            }
        }, 
        async mounted () {
        },
        emits: ['click'],
        methods: {
            selectEncounter () {
                this.$emit('click', this.itemEncounter)
            }
        },
        computed: {
            isSelected() {
                if (this.selectedEncounter === null) {
                    return false;
                } 
                return this.selectedEncounter.id === this.itemEncounter.id;
            }
        }
    }
</script>

<style scoped lang="css">
    .attention {
        color: red;
    }
    .current-selection {
        background-color: #aed5ff;
    }

</style>