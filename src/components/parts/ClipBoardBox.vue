<template>
    <div id="clip-board-box-container">
        <div id="hpo-clip-container" v-if="clipBoardTerms && clipBoardTerms.length > 0">
            <textarea
                id="hpo-term-clipboard"
                name="hpo-terms-text"
                cols="30"
                rows="10"
                v-model="clipBoardText"
                readonly="true"
            ></textarea>
        </div>
        <div id="hpo-clip-container" v-else>
            <p>Nothing to show, select and send terms to populate.</p>
        </div>
        <div id="clip-btns-container">
            <fieldset id="format">
                <legend>List Format</legend>
                <label for="">
                    <input type="radio" name="list-format" value="hpo-ids" v-model="clipBoardFormat" /> HPO IDs
                </label>
                <label for="">
                    <input type="radio" name="list-format" value="hpo-terms" v-model="clipBoardFormat" /> HPO Terms
                </label>
                <label for="">
                    <input type="radio" name="list-format" value="hpo-ids-terms" v-model="clipBoardFormat" /> IDs & Terms
                </label>
            </fieldset>
            <button class="clip-board-box-btn" @click="copyToClipboard">Copy List</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ClipBoardBox',
    props: {
        clipBoardTerms: Array,
    },
    data() {
        return {
            clipBoardText: '',
            clipBoardFormat: 'hpo-ids',
        };
    },
    async mounted() {
        this.setText();
    },
    methods: {
        setText() {
            if (!this.clipBoardTerms || this.clipBoardTerms.length === 0) {
                return;
            }
            if (this.clipBoardFormat === 'hpo-ids') {
                this.clipBoardText = this.clipBoardTerms.map((term) => term.getHpoId()).join(', ');
            } else if (this.clipBoardFormat === 'hpo-terms') {
                this.clipBoardText = this.clipBoardTerms.map((term) => term.getPhenotypeName()).join(', ');
            } else if (this.clipBoardFormat === 'hpo-ids-terms') {
                this.clipBoardText = this.clipBoardTerms
                    .map((term) => `${term.getHpoId()} - ${term.getPhenotypeName()}`)
                    .join(', ');
            }
        },
        async copyToClipboard() {
            try {
                await navigator.clipboard.writeText(this.clipBoardText);
            } catch (error) {
                let textArea = document.createElement('textarea');
                textArea.textContent = this.clipBoardText;
                document.body.appendChild(textArea);
                textArea.select();
                //This command is considered obsolete but is the only way to make this work if the iframe doesn't support the clipboard API
                document.execCommand('copy');
                textArea.remove();
            }
        },
    },
    watch: {
        clipBoardTerms: function (newVal, oldVal) {
            this.setText();
        },
        clipBoardFormat: function (newVal, oldVal) {
            this.setText();
        },
    },
};
</script>

<style scoped lang="css">
#clip-board-box-container {
    width: 100%;
    height: 20%;
    border-radius: 3px;
    padding: 3px 5px;

    box-shadow:
        0 3px 1px -2px rgba(79, 79, 79, 0.2),
        0 2px 2px 0 rgba(79, 79, 79, 0.2),
        0 1px 5px 0 rgba(79, 79, 79, 0.2);

    display: flex;
    flex-direction: row;

    background-color: white;
    transition: height 0.3s ease-in-out;
}
#clip-board-box-container * {
    box-sizing: border-box;
}
#clip-board-box-container.closed {
    height: 0px;
    padding: 0px;
    border: none;
    margin: 0px;
    overflow: hidden;
}
#hpo-clip-container {
    width: 90%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

#clip-btns-container {
    width: 10%;
    min-width: 110px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 0.8em;
    overflow: hidden;
}

/* At short heights make the clip-btns-container text much smaller */
@media (max-height: 700px) {
    #clip-btns-container {
        font-size: 0.7em;
    }

    .clip-board-box-btn {
        max-height: 25px;
        font-size: 0.95em;
    }
}

button {
    width: 90%;
    height: 50%;
    border: none;
    border-radius: 3px;
    margin-bottom: 5px;
    background-color: rgb(0, 113, 189);
    color: white;
}
.clip-board-box-btn {
    max-height: 30px;
}
.clip-board-box-btn:hover {
    background-color: rgb(0, 113, 189, 0.8);
}
.clip-board-box-btn:active {
    background-color: rgba(4, 83, 136);
}

#format {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    border: none;
    padding: 1px;
    min-width: 101px;
}

#hpo-term-clipboard {
    width: 100%;
    height: 95%;
    border: rgb(215, 215, 215) 1px solid;
    overflow-y: auto;
    font-size: 1em;
    resize: none;
    padding: 0.5em;

    border-radius: 3px;
}
</style>
