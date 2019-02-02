const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "config",
	description: "Configure bot",
	syntax: "config_option config_value",
	admin: true,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	CoreUtil.dateLog(params);

	switch(params[0]) {
		case 'set_group_category':
			if (params[1].length > 0 && !isNaN(params[1])) {
				guildData.updateGroupCategory(category);
			} else {
				return Promise.resolve("You must specify a category ID.");
			}
			break;
		case 'set_mod_role':
			if (message.mentions.roles.size > 0) {
				guildData.updateOfficerRoleId(message.mentions.roles.first().id)
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		case 'set_member_role':
			if (message.mentions.roles.size > 0) {
				guildData.updateMemberRoleId(message.mentions.roles.first().id)
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		default:
			return Promise.resolve(params[0] + " is an invalid configuration");
	}

	return Promise.resolve(params[0] + " set to " + params[1]);
}
