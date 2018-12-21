const CoreUtil = require("../utils/Util.js");
const Camo = require("camo");

module.exports = class UserData extends Camo.Document {
    constructor() {
        super();

        this.schema({
            user_id: String,
            guild_id: String,
            username: String,
            level: { type: Number, default: 1, min: 1, max: 99 },
            exp: { type: Number, default: 0, min: 0},
            currency: { type: Number, default: 0, min: 0},
            rank: { type: String, default: "Padawan" },
            class: { type: String, default: "Padawan" },
            messages: { type: Number, default: 0, min: 0 },
            reactions: { type: Number, default: 0, min: 0 },
            lotteries: { type: Number, default: 0, min: 0 },
            praise: { type: Number, default: 0, min: 0 },
            activity_points: { type: Number, default: 0, min: 0 },
            last_message: Date,
            last_online: Date,
            last_reaction: Date,
            last_lottery: Date,
            last_active: Date
		});
    }
};

/*class Activity extends EmbeddedDocument {  
    constructor() {
        super();

        this.schema({
            messages: { type: Number, default: 0 },
            reactions: { type: Number, default: 0 },
            lotteries: { type: Number, default: 0 },
            praise: { type: Number, default: 0 },
            activity_points: { type: Number, default: 0 }
        });
    }
};*/