<template>
    <p 
    :class="color ? 'attention' : ''"
    @click="selectEncounter">{{ encounter.id }}</p>
</template>

<script>
    export default {
        name: 'SelectItem',
        props: {
            encounter: Object,
            color: Boolean,
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
        }
    }
</script>

<style scoped lang="css">
    .attention {
        color: red;
    }

</style>