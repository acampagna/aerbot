const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Command = require("../Command.js");
const WarTeam = mongoose.model('WarTeam');
const MonthlyActivity = mongoose.model('MonthlyActivity');
const User = mongoose.model('User');

module.exports = new Command({
	name: "war",
	description: "Team War!",
	syntax: "war",
	admin: true,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	switch(params[0]) {
		case 'create_team':
			if (params[1].length > 0) {
				WarTeam.create({_id: params[1], name: "Team " + params[1], members: new Array()});
				return Promise.resolve("Team " + params[1] + " created!");
			} else {
				return Promise.resolve("You must specify a Team Id.");
			}
			break;
		case 'generate_teams':
			await generateTeams(message.guild);
			return Promise.resolve("Generating Teams!");
			break;
		default:
			return Promise.resolve(params[0] + " is an invalid configuration");
	}
}

async function generateTeams(server) {
	var today = new Date(); 
	var activeThreshold = new Date();
	activeThreshold.setDate(today.getDate() - 14);

	const teams = await WarTeam.findAllTeams();
	//console.log(teams);
	teams.forEach(team => {
		console.log(team.id + " : " + team.name);
	});

	const stats = await MonthlyActivity.getStatistics();
	let avgExp = stats.avgExp;

	console.log(avgExp);
	console.log(today);
	console.log(activeThreshold);

	const activeMembers = await User.findActiveSince(activeThreshold);

	//console.log(activeMembers);

	console.log(activeMembers.length);
}

async function determineUserBuckets(server) {
	
}