const CoreUtil = require("../../utils/Util.js");

/**
 * Simple example and default implementation of a Gacha game
 * Note, only 1 gacha can be done at a time across all servers because of the lack of
 * member variables. This will be fixed when I convert to TypeScript.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
class Gacha {
    constructor(){
        this.init();
    }

    init() {
        CoreUtil.dateLog("Initialized DICE Game! " + this.rollDice());
    }

    enter() {
        CoreUtil.dateLog("User Entry DICE Game!");
        let x = this.rollDice();
        CoreUtil.dateLog(x);
    }

    rollDice() {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        return randomNumber;
    }
}

module.exports = Gacha