const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "group-set-category",
	description: "Sets the category that all groups are created in",
	syntax: "group-set-category",
	admin: true,
	invoke
});

function invoke({ message, params, guildData, client }) {
	var category = params[0];
	guildData.updateGroupCategory(category);
	return Promise.resolve("Set Group Category: " + category);
}
