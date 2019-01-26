const Command = require("../Command.js");
const ParentPackageJson = require("../../package.json");

module.exports = new Command({
	name: "version",
	description: "Return version number",
	syntax: "version",
	admin: false,
	invoke
});

/**
 * Prints bot version. Useless.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke() {
	return Promise.resolve(ParentPackageJson.version);
}