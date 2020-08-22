const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');
const Discord = require("discord.js");

module.exports = new Command({
	name: "eggs",
	description: "Get Eggs Leaderboard",
	syntax: "eggs",
	admin: false,
	invoke
});

/**
 * Lists all groups. Adds/Removes a group for a user if they specify a group by adding the group's role to them.
 * UNFINISHED. NEEDS TO BE CLEANED UP A BIT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	var limit = 50;
	var userActivity = new Map();

	return new Promise(function(resolve, reject) {
		Activity.findActivitySince(1).then(activities => {
			activities.forEach(activity =>{
				if(activity.type === "holiday_hunter") {
					if(userActivity.has(activity.userId)) {
						userActivity.set(activity.userId, userActivity.get(activity.userId)+activity.exp);
					} else {
						userActivity.set(activity.userId, activity.exp);
					}
				}
			});

			const sortedUserActivity = new Map([...userActivity.entries()].sort((a, b) => b[1] - a[1]));

			const embed = new Discord.RichEmbed();
			embed.setTitle("**Egg Hunting Leaderboard**");
			embed.setColor("RANDOM");

			//DiscordUtil.constructTableFromMap(serviceAccounts);
			var total = 0
			console.log(total);

			var retStr = "";
			sortedUserActivity.forEach(function(value, key) {
				total++;
				//console.log("T: " + total + " L: " + limit);
				if(total <= limit && total > 0) {
					let member = client.guilds.get(serverData._id).members.get(key);

					if(total === 1) {
						let avatar = member.user.avatarURL;
						embed.setThumbnail(avatar);
					}

					if(member){
						retStr += parseInt(total) + ". " +  member + " : " + (value/50) + " eggs\n";
					} else {
						total--;
					}
				}
			});

			embed.setDescription(retStr);
			resolve({embed});
		});
	});
}