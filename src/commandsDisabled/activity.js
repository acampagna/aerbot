const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const DailyActivity = mongoose.model('DailyActivity');
const WeeklyActivity = mongoose.model('WeeklyActivity');
const MonthlyActivity = mongoose.model('MonthlyActivity');
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
				resolve("Supported activity durations: `daily`, `weekly`, and `monthly`");
				break;
			case 'types':
				resolve("Supported activity types: `message`, `reaction`, `event`, `voice`");
				break
		}

		var ActivityClass;

		if(activityDuration.toLowerCase() === "daily") {
			ActivityClass = DailyActivity;
		} else if(activityDuration.toLowerCase() === "weekly") {
			ActivityClass = WeeklyActivity;
		} else if(activityDuration.toLowerCase() === "monthly") {
			ActivityClass = MonthlyActivity;
		} else {
			resolve(activityDuration + " activity has not been implemented yet!");
		}

		switch(cmd) {
			case 'member':
				break;
			case 'stats':
				//if(activityDuration.toLowerCase() === "monthly") {
					ActivityClass.getStatistics().then(response => {
						//console.log(response);
						const embed = new Discord.RichEmbed();
						embed.setTitle(activityDuration + " Statistics");
						embed.setColor("RANDOM");

						//console.log(typeActivity);

						let message = response.typeActivity.get("message");
						let reaction = response.typeActivity.get("reaction");
						let event = response.typeActivity.get("event");
						let voice = response.typeActivity.get("voice");
						let total = response.typeActivity.get("total");

						embed.addField("Message Exp", message);
						embed.addField("Reaction Exp", reaction);
						embed.addField("Event Exp", event);
						embed.addField("Voice Exp", voice);
						embed.addField("Trivia Question Exp", response.typeActivity.get("trivia_question"));
						embed.addField("Trivia Game Exp", response.typeActivity.get("trivia_game"));
						embed.addField("Total Exp", total);
						embed.addField("Active Users", response.activeUsers);
						embed.addField("Mean Exp", response.avgExp);

						resolve({embed});
					});
				//}
				break;
			case 'total':
				var actionType = "all";
				switch(newParams[2]) {
					case 'message':
					case 'reaction':
					case 'event':
					case 'voice':
					case 'trivia_question':
					case 'trivia_game':
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

				var skip = 0;
				if(!isNaN(newParams[3])) {
					skip = newParams[3];
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

					var total = -skip;
					console.log(skip);
					console.log(total);
					sortedUserActivity.forEach(function(value, key) {
						total++;
						if(total <= limit && total > 0) {
							let member = client.guilds.get(serverData._id).members.get(key);

							if(total === 1) {
								let avatar = member.user.avatarURL;
								embed.setThumbnail(avatar);
							}

							if(member){
								embed.addField((total + skip) + ". " +  member.displayName, value + " exp");
							} else {
								total--;
							}	
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