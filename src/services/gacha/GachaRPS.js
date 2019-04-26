const CoreUtil = require("../../utils/Util.js");

class GachaRPS {
    constructor(){
        this.init();
    }

    init() {
        CoreUtil.dateLog("Initialized RPS Game!");
    }

    enter() {
        CoreUtil.dateLog("User Entry RPS Game!");
        let x = "RPS GACHA GAME!"
        CoreUtil.dateLog(x);
    }
}

module.exports = GachaRPS