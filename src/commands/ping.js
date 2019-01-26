const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "ping",
	description: "You Ping, I Pong!",
	syntax: "ping",
	admin: false,
	invoke
});

/**
 * Ping.Pong.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	return Promise.resolve("Pong!");
}
