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
function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	switch(params[0]) {
		case 'set_group_category':
			if (params[1].length > 0 && !isNaN(params[1])) {
				serverData.updateGroupCategory(category);
			} else {
				return Promise.resolve("You must specify a category ID.");
			}
			break;
		case 'set_mod_role':
			if (message.mentions.roles.size > 0) {
				serverData.updateOfficerRoleId(message.mentions.roles.first().id)
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		case 'set_member_role':
			if (message.mentions.roles.size > 0) {
				serverData.updateMemberRoleId(message.mentions.roles.first().id)
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		case 'set_moderator_role':
			if (message.mentions.roles.size > 0) {
				serverData.updateModeratorRoleId(message.mentions.roles.first().id)
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		case 'set_admin_role':
			if (message.mentions.roles.size > 0) {
				serverData.updateAdminRoleId(message.mentions.roles.first().id)
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		case 'set_level_role':
			if (message.mentions.roles.size > 0 && !isNaN(params[1])) {
				if(!serverData.levelRoles) {
					serverData.levelRoles = {};
				}
				serverData.levelRoles.set(params[1], message.mentions.roles.first().id);
				serverData.save();
			} else {
				return Promise.resolve("You must select a minimum level and @mention an existing role");
			}
			break;
		default:
			return Promise.resolve(params[0] + " is an invalid configuration");
	}
	
	//updateSpotlightChannel

	return Promise.resolve(params[0] + " set to " + params[1]);
}
