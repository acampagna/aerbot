const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "me",
	description: "Sets things about your character",
	syntax: "me",
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

	switch(params[0]) {
		case 'weapon':
			if (params[1].length > 0 && !isNaN(params[1])) {
				serverData.updateGroupCategory(category);
			} else {
				return Promise.resolve("You must specify a category ID.");
			}
			break;
		case 'fggdfgsf':
			if (message.mentions.channels.size > 0) {
				serverData.updateBotChannelId(message.mentions.channels.first().id)
			} else {
				return Promise.resolve("You must @mention an existing channel");
			}
			break;
		default:
			return Promise.resolve(params[0] + " is an invalid configuration");
	}
	
	//updateSpotlightChannel

	return Promise.resolve(params[0] + " set to " + params[1]);
}
