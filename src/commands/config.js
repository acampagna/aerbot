const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "config",
	description: "Configure bot",
	syntax: "config_option config_value",
	admin: true,
	invoke
});

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
			guildData.officerRoleID = message.mentions.roles.first().id;
		} else {
			return Promise.resolve("You must @mention an existing role");
		}
		break;
		default:
			return Promise.resolve(params[0] + " is an invalid configuration");
	}

	return Promise.resolve(params[0] + " set to " + params[1]);
}
