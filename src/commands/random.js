const CoreUtil = require("../utils/Util.js");
const Discord = require("discord.js");
const Command = require("../Command.js");

module.exports = new Command({
	name: "random",
	description: "Pick a random item from a list of items separated by commas. Optional: each item can have :# to specify the number of entries that item has. (e.g. Aerfalle:3)",
	syntax: "random",
	admin: false,
	invoke
});

/**
 * Utility to pick a random item from a list of items separated by commas. Used for things like raffles.
 * Optional: each item can have :# to specify the number of entries that item has. (e.g. Aerfalle:3)
 * NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	//CoreUtil.dateLog(params);

	let numWinners = params[0];
	let newParams = params.slice(1).join(" ").split(",").map(p => p.trim());

	//CoreUtil.dateLog(newParams);
	
	let entries = [];

	newParams.forEach(p => {
		let s = p.split(":").map(pp => pp.trim());
		if(s.length > 1) {
			for (i = 0; i < s[1]; i++) { 
				entries.push(s[0]);
			}
		} else {
			entries.push(s[0]);
		}
	});

	//CoreUtil.dateLog(entries);

	let winners = ""
	if(numWinners == 1) {
		winners = "\n**Winner:** ";
	} else {
		winners = "\n**Winners**\n";
	}
	
	for (i = 0; i < numWinners; i++) { 
		let winner = Math.floor(Math.random()*entries.length);
		winners += entries[winner] + "\n";
		
		//entries.splice(winner, 1);
		entries = entries.filter(e => e != entries[winner]);
		
		//CoreUtil.dateLog(entries);
	}

	return Promise.resolve(winners);
}
