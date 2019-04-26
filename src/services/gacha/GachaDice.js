const CoreUtil = require("../../utils/Util.js");

var entries = new Map();
class GachaDice {
    constructor(){
        //this.init();
    }

    init() {
        CoreUtil.dateLog("Initialized DICE Game! " + this.rollDice());
        entries = new Map();
    }

    hasUserEntered(key) {
        return entries.has(key);
    }

    enter(member) {
        let roll = this.rollDice();
        entries.set(member, roll);
        console.log(entries);
        return roll;
    }

    rollDice() {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        return randomNumber;
    }
}

module.exports = GachaDice