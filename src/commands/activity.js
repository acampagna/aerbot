const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');
const Discord = require("discord.js");
const MemberFetchingService = require("../services/MemberFetchingService");

module.exports = new Command({
	name: "activity",
	description: "New Activity Commands",
	syntax: "activity",
	admin: true,
	invoke
});

const MFS = new MemberFetchingService();

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

	var cmd = newParams[0];
	var activityDuration = newParams[1] ? newParams[1] : 7;

	console.log("Activity Duration: " + activityDuration);

	return new Promise(function(resolve, reject) {
		switch(cmd) {
			case 'durations':
				resolve("Supported activity durations are measured in any number of days. i.e. 1, 7, 30, etc.");
				break;
			case 'types':
				resolve("Supported activity types: `message`, `reaction`, `event`, `voice`");
				break
		}

		var date = new Date();
        date.setDate( date.getDate() - activityDuration );

		switch(cmd) {
			case 'member':
				if(message.mentions.users.first()) {
					var memberId = message.mentions.users.first().id;
				} else if(params[2]){
					var memberId = params[2];
				}

				if (memberId) {
					Activity.getStatistics(activityDuration, memberId).then(response => {
						console.log(response);
						console.log(response.typeActivity);
						const embed = new Discord.RichEmbed();
						embed.setTitle("**Statistics** - Past " + activityDuration + " Days");
						embed.setColor("RANDOM");
	
						if(response.typeActivity.get("message") > 0)
							embed.addField("Message Exp", response.typeActivity.get("message"));
						if(response.typeActivity.get("reaction") > 0)
							embed.addField("Reaction Exp", response.typeActivity.get("reaction"));
						if(response.typeActivity.get("event") > 0)
							embed.addField("Event Exp", response.typeActivity.get("event"));
						if(response.typeActivity.get("voice") > 0)
							embed.addField("Voice Exp", response.typeActivity.get("voice"));
						if(response.typeActivity.get("pinned") > 0)
							embed.addField("Pinned", response.typeActivity.get("pinned"));
						if(response.typeActivity.get("trivia") > 0)
							embed.addField("Trivia Exp", response.typeActivity.get("trivia"));
						if(response.typeActivity.get("qotd") > 0)
							embed.addField("QOTD Exp", response.typeActivity.get("qotd"));
						if(response.typeActivity.get("stream") > 0)
							embed.addField("Stream Exp", response.typeActivity.get("stream"));
						if(response.typeActivity.get("greet") > 0)
							embed.addField("Welcome Exp", response.typeActivity.get("greet"));
						if(response.typeActivity.get("achievement") > 0)
							embed.addField("Achievement Exp", response.typeActivity.get("achievement"));

						embed.addField("Total Exp", response.typeActivity.get("total"));
						//embed.addField("Active Users", response.activeUsers);
						//embed.addField("Mean Exp", response.avgExp);
	
						resolve({embed});
					});
				} else {
					resolve("You must @mention a user or provide their user id to get stats");
				}
				break;
			case 'stats':
				Activity.getStatistics(activityDuration).then(response => {
					console.log(response);
					console.log(response.typeActivity);
					const embed = new Discord.RichEmbed();
					embed.setTitle("**Statistics** - Past " + activityDuration + " Days");
					embed.setColor("RANDOM");

					embed.addField("Message Exp", response.typeActivity.get("message"));
					embed.addField("Reaction Exp", response.typeActivity.get("reaction"));
					embed.addField("Event Exp", response.typeActivity.get("event"));
					embed.addField("Voice Exp", response.typeActivity.get("voice"));
					embed.addField("Pinned", response.typeActivity.get("pinned"));
					if(response.typeActivity.get("trivia") > 0)
						embed.addField("Trivia Exp", response.typeActivity.get("trivia"));
					if(response.typeActivity.get("qotd") > 0)
						embed.addField("QOTD Exp", response.typeActivity.get("qotd"));
					if(response.typeActivity.get("stream") > 0)
						embed.addField("Stream Exp", response.typeActivity.get("stream"));
					if(response.typeActivity.get("greet") > 0)
						embed.addField("Welcome Exp", response.typeActivity.get("greet"));
					embed.addField("Achievement Exp", response.typeActivity.get("achievement"));
					embed.addField("Total Exp (minus achievements)", response.typeActivity.get("total"));
					embed.addField("Active Users", response.activeUsers);
					embed.addField("Mean Exp", response.avgExp);

					resolve({embed});
				});
				//resolve("Stats activity not yet implemented!");
				break;
			case 'total':
				switch(newParams[2]) {
					case 'message':
					case 'reaction':
					case 'event':
					case 'voice':
					case 'trivia_question':
					case 'trivia_game':
					case 'br_win':
					case 'qotd':
					case 'pinned':
					case 'achievement':
					case 'stream_engagement':
					case 'stream_contribution':
					case 'stream_mvp':
					case 'holiday_hunter':
					case 'greet':
						Activity.countDocuments({type: newParams[2], date : {"$gte": date}}, function (err, count) {
							resolve("Total " + newParams[2] + " activity in past " + activityDuration + " days: " + count);
						});
						break;
					default:
						Activity.countDocuments({date : {"$gte": date}}, function (err, count) {
							resolve("Total activity in past " + activityDuration + " days: " + count);
						});
						break;
				}
				break;
			case 'recent':
				var limit = 10;
				if(!isNaN(newParams[2])){
					limit = newParams[2];
				}
				resolve("Recent Activity not yet implemented");
				break;
			case 'leaderboard':
				//newParams2 = limit
				//newParams3 = offset
				var limit = 10;
				if(!isNaN(newParams[2])){
					limit = newParams[2];
				}

				var skip = 0;
				if(!isNaN(newParams[3])) {
					skip = newParams[3];
				}

				var userActivity = new Map();

				Activity.findActivitySince(activityDuration).then(activities => {
					activities.forEach(activity =>{
						if(activity.type != "achievement" && activity.type != "holiday_hunter") {
							if(activity.userId == "337760608617496588") {
								console.log(activity.type + ": " + activity.exp);
							}
							if(userActivity.has(activity.userId)) {
								userActivity.set(activity.userId, userActivity.get(activity.userId)+activity.exp);
							} else {
								userActivity.set(activity.userId, activity.exp);
							}
						}
					});

					const sortedUserActivity = new Map([...userActivity.entries()].sort((a, b) => b[1] - a[1]));

					const embed = new Discord.RichEmbed();
					embed.setTitle("**Activity Leaderboard** - Past " + activityDuration + " days");
					embed.setColor("RANDOM");

					//DiscordUtil.constructTableFromMap(serviceAccounts);
					var total = -skip;
					console.log(skip);
					console.log(total);

					var retStr = "";
					sortedUserActivity.forEach(function(value, key) {
						total++;
						console.log("T: " + total + " L: " + limit + " S: " + skip);
						if(total <= limit && total > 0) {
							let member = client.guilds.get(serverData._id).members.get(key);

							if(total === 1) {
								let avatar = member.user.avatarURL;
								embed.setThumbnail(avatar);
							}

							if(member){
								retStr += (parseInt(total) + parseInt(skip)) + ". " +  member + " : " + value + " exp\n";
							} else {
								total--;
							}
						}
					});

					embed.setDescription(retStr);
					resolve({embed});
				});
				break;
			case 'leaderboard_new':
				//newParams2 = limit
				//newParams3 = offset
				var limit = 10;
				if(!isNaN(newParams[2])){
					limit = newParams[2];
				}

				var skip = 0;
				if(!isNaN(newParams[3])) {
					skip = newParams[3];
				}
				
				var role = message.guild.roles.get("525992621999521802");
				var newMembers = MFS.getMembersInRole(role);
				var ids = newMembers.map(m => m.id);

				var userActivity = new Map();

				Activity.findAllRecentActivityIn(7, ids).then(activities => {
					activities.forEach(activity =>{
						if(activity.type != "achievement" && activity.type != "holiday_hunter") {
							if(activity.userId == "337760608617496588") {
								console.log(activity.type + ": " + activity.exp);
							}
							if(userActivity.has(activity.userId)) {
								userActivity.set(activity.userId, userActivity.get(activity.userId)+activity.exp);
							} else {
								userActivity.set(activity.userId, activity.exp);
							}
						}
					});

					const sortedUserActivity = new Map([...userActivity.entries()].sort((a, b) => b[1] - a[1]));

					const embed = new Discord.RichEmbed();
					embed.setTitle("**New Member Leaderboard** - Past " + activityDuration + " days");
					embed.setColor("RANDOM");

					//DiscordUtil.constructTableFromMap(serviceAccounts);
					var total = -skip;
					console.log(skip);
					console.log(total);

					var retStr = "";
					sortedUserActivity.forEach(function(value, key) {
						total++;
						console.log("T: " + total + " L: " + limit + " S: " + skip);
						if(total <= limit && total > 0) {
							let member = client.guilds.get(serverData._id).members.get(key);

							if(total === 1) {
								let avatar = member.user.avatarURL;
								embed.setThumbnail(avatar);
							}

							if(member){
								retStr += (parseInt(total) + parseInt(skip)) + ". " +  member + " : " + value + " exp\n";
							} else {
								total--;
							}
						}
					});

					embed.setDescription(retStr);
					resolve({embed});
				});
				break;
			default:
				resolve(params[0] + " is an invalid configuration");
			}
	});
}