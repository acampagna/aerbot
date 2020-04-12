const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "qotd",
	description: "Sets the question of the day",
	syntax: "qotd question",
	admin: true,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);
	var question = params.join(" ");

	if (question.length > 0) {
		serverData.updateQotd(question);
		serverData.updateQotdMessageId("");
		serverData.resetMsgsSinceNewQotd();
		client.channels.get(serverData.qotdChannelId).send("**Previous Question of the Day has ended!**");

		CoreUtil.sendQotd(question, client, serverData);

		return Promise.resolve("QOTD set to " + question);
	} else {
		return Promise.resolve("You must specify a question!");
	}
}
