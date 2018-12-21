const CoreUtil = require("../utils/Util.js");
const Camo = require("camo");

module.exports = class LotteryData extends Camo.Document {
    constructor() {
        super();

        this.schema({
            lottery_id: String,
            guild_id: String,
            title: String,
            description: String,
            question: String,
            duration: { type: Number, default: 1, min: 1},
            prizes: { type: Array, default: [] },
            start_date: Date, 
            end_date: Date,
            //max_entries: { type: Number, default: 0, min: 0, max: 99},
            num_entries: { type: Number, default: 0, min: 0, max: 99},
            last_entry: Date,
            is_active: { type: Boolean, default: false }
		});
    }
};