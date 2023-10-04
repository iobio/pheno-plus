class Encounter {
    constructor(id, type, reason, start, end) {
        this.id = id;
        this.type = type;
        this.reason = reason;
        this.start = start;
        this.end = end;
        this.text = reason;
    }

    //Getters and Setters
    getId() {
        return this.id;
    }
    getType() {
        return this.type;
    }
    getReason() {
        return this.reason;
    }
    getStart() {
        return this.start;
    }
    getEnd() {
        return this.end;
    }
    setId(id) {
        this.id = id;
    }
    setType(type) {
        this.type = type;
    }
    setReason(reason) {
        this.reason = reason;
    }
    setStart(start) {
        this.start = start;
    }
    setEnd(end) {
        this.end = end;
    }
}

export default Encounter;