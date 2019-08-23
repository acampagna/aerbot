const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "group-set-category",
	description: "Sets the category that all groups are created in",
	syntax: "group-set-category",
	admin: true,
	invoke
});

/**
 * Sets the group category where all groups will be added to
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	var category = params[0];
	serverData.updateGroupCategory(category);
	return Promise.resolve("Set Group Category: " + category);
}
