const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
const Camo = require("camo");

module.exports = class GuildData extends Camo.Document {
    constructor() {
        super();

        this.schema({
			guildID: String,
            inactiveThresholdDays: { type: Number, default: 7, min: 1 },
			officerRoleID: String,
			memberRoleID: String,
			currentLotteryID: String,
			lastLotteryID: String,
			lotteryChannel: String,
			lastLotteryAnnounce: Date,
			tipChannel: String,
			lastTip: Date
		});
	}
};