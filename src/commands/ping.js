const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "ping",
	description: "You Ping, I Pong!",
	syntax: "ping",
	admin: false,
	invoke
});

function invoke({ message, params, guildData, client }) {
	return Promise.resolve("Pong!");
}
