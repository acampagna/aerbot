const CoreUtil = require("../utils/Util.js");
const Camo = require("camo");

module.exports = class LotteryEntryData extends Camo.Document {
    constructor() {
        super();

        this.schema({
            user_id: String,
            lottery_id: String,
            guild_id: String,
            username: String,
            entries: { type: Number, default: 1, min: 1, max: 99},
            answer: String
		});
    }
};