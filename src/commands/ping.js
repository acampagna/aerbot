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
function invoke({ message, params, serverData, client }) {
	var nparams4 = params.join(" ").split(/"((?:\\.|[^"\\])*)"/);
	var nparams3 = new Map(
		params.slice(1).join(" ").split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/\"/g, "").split(":").map(m => m.trim())).map(([k, v]) => [k.toLowerCase(), v])
	);
	var nparams2 = params.join(" ").split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	var nparams =  params.join(" ").split(/,(["'])(?:(?=(\\?))\2.)*?\1/);

	console.log(message);
	console.log(nparams);
	console.log(nparams2);
	console.log(nparams3);
	console.log(nparams4);
	return Promise.resolve("Pong!");
}
