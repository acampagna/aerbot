const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const DailyActivity = mongoose.model('DailyActivity');
const WeeklyActivity = mongoose.model('WeeklyActivity');
const Discord = require("discord.js");

module.exports = new Command({
	name: "activity",
	description: "Activity Commands",
	syntax: "activity",
	admin: true,
	invoke
});

/**
 * Lists all groups. Adds/Removes a group for a user if they specify a group by adding the group's role to them.
 * UNFINISHED. NEEDS TO BE CLEANED UP A BIT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	var paramStr = params.join(" ");
	var newParams = paramStr.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
    }, {a: ['']}).a
	console.log(newParams);

	var cmd = newParams[1];
	var activityDuration = newParams[0];

	return new Promise(function(resolve, reject) {
		switch(newParams[0]) {
			case 'durations':
				resolve("Supported activity durations: `daily`");
				break;
			case 'types':
				resolve("Supported activity types: `message`, `reaction`, `event`");
				break
		}

		var ActivityClass;

		if(activityDuration.toLowerCase() === "daily") {
			ActivityClass = DailyActivity;
		} else if(activityDuration.toLowerCase() === "weekly") {
			ActivityClass = WeeklyActivity;
		} else {
			resolve(activityDuration + " activity has not been implemented yet!");
		}

		switch(cmd) {
			case 'member':
				break;
			case 'total':
				var actionType = "all";
				switch(newParams[2]) {
					case 'message':
					case 'reaction':
					case 'event':
						ActivityClass.countDocuments({type: newParams[2]}, function (err, count) {
							resolve("Total " + activityDuration + " " + newParams[2] + " activity: " + count);
						});
						break;
					default:
						ActivityClass.countDocuments({}, function (err, count) {
							resolve("Total " + activityDuration + " activity: " + count);
						});
						break;
				}
				break;
			case 'recent':
				var limit = 10;
				if(!isNaN(newParams[2])){
					limit = newParams[2];
				}
				resolve("We're not currently tracking time & date for activity. Sorry!");
				break;
			case 'leaderboard':
				var limit = 10;
				if(!isNaN(newParams[2])){
					limit = newParams[2];
				}

				var userActivity = new Map();

				ActivityClass.findAllActivity().then(activities => {
					activities.forEach(activity =>{
						if(userActivity.has(activity.userId)) {
							userActivity.set(activity.userId, userActivity.get(activity.userId)+activity.exp);
						} else {
							userActivity.set(activity.userId, activity.exp);
						}
					});

					const sortedUserActivity = new Map([...userActivity.entries()].sort((a, b) => b[1] - a[1]));

					const embed = new Discord.RichEmbed();
					embed.setTitle(activityDuration + " Activity Leaderboard");
					embed.setColor("RANDOM");
					//embed.setDescription("The rules are simple. Everyone ");
					//embed.setFooter("Currently this is showing ALL users with " + activityDuration + " activity. Soon it will show top 10 (or top x) members with the most activity");

					var total = 0;
					sortedUserActivity.forEach(function(value, key) {
						total++;
						if(total <= limit) {
							let member = client.guilds.get(serverData._id).members.get(key);
							let username = member.displayName;

							if(total === 1) {
								let avatar = member.user.avatarURL;
								embed.setThumbnail(avatar);
							}

							embed.addField(total + ". " + username, value + " exp");
						}
					});
					resolve({embed});
				});

				break;
			default:
				resolve(params[0] + " is an invalid configuration");
			}
	});
}