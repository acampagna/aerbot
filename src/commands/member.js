const CoreUtil = require("../utils/Util.js");
const MemberUtil = require("../utils/MemberUtil.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const DateDiff = require("date-diff");
const Achievement = mongoose.model('Achievement');
const AchievementService = require("../services/AchievementService");

const AS = new AchievementService();

module.exports = new Command({
	name: "member",
	description: "Do operations on members",
	syntax: "member",
	admin: false,
	invoke
});

async function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	return new Promise(function(resolve, reject) {

		var getAdminStats = (CoreUtil.isMemberAdmin(message, serverData));

		if(message.mentions.users.first()) {
			var memberId = message.mentions.users.first().id;
		} else if(params[0]){
			var memberId = params[0];
		} else {
			var memberId = message.member.id;
			getAdminStats = false;
		}

		User.findById(memberId).exec().then(async user => {
			var embed = await createEmbed(user, client, serverData, getAdminStats);
			resolve ({embed});
		});

		/*if(!CoreUtil.isMemberAdmin(message, serverData)) {
			console.log("NO ADMIN OR NO PARAMS 0!");
			User.findById(message.member.id).exec().then(user => {
				var embed = createEmbed(user, client, serverData, false);
				resolve ({embed});
			});
		} else {
			switch(params[0]) {
				case 'stats':
					if(!params[1]) {
						resolve(params[1] + " is an invalid or missing parameter.");
					} else {
						
						if(message.mentions.users.first()) {
							var memberId = message.mentions.users.first().id;
						} else {
							var memberId = params[1];
						}
						
						User.findById(memberId).exec().then(user => {
							var embed = createEmbed(user, client, serverData, true);
							resolve ({embed});
						});
					}
					break;
				default:
					console.log("NO PARAMS 1!");
					User.findById(message.member.id).exec().then(user => {
						var embed = createEmbed(user, client, serverData, false);
						resolve ({embed});
					});*/
	});
}

async function createEmbed(user, client, serverData, admin) {
	CoreUtil.dateLog("Member Found: " + user.username);
	const now = new Date();
	var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

	let member = client.guilds.get(serverData._id).members.get(user.id);

	var embedColor = "DEFAULT";

	if(user.embedColor) {
		embedColor = user.embedColor;
	}

	var desc = "**Achievements**\n";

	if(user.badges) {
		var achievements = await Achievement.findInIds(Array.from( user.badges.keys() ));
		console.log(user.badges);
		achievements.forEach(a => {
			if(a.emoji.length > 5) {
				var emoji = client.emojis.get(a.emoji);
			} else {
				var emoji = a.emoji;
			}

			desc += AS.getAchievementNiceDescription(a, client, a.ranks[user.badges.get(a.id)], user.badges.get(a.id));
	
			/*if(a.ranks.length > 0) {
				desc += emoji + " " + a.name + " - " + AS.getAchievementDescription(a,a.ranks[user.badges.get(a.id)]) + "\n";
			} else {
				desc += emoji + " " + a.name + " - " + AS.getAchievementDescription(a,a.ranks[user.badges.get(a.id)]) + "\n";
			}*/
		});
	} else {
		desc += "*None*";
	}
	

	const embed = new Discord.RichEmbed().setTitle(`__${user.username} Stats__`);
	embed.setDescription(desc);
	if(admin) {
		embed.addField("ID", user.id);
	}
	embed.addField("Level", `${user.level}`);
	embed.addField("Exp", `${user.exp}`);
	embed.addField("Exp to Level " + (user.level+1), MemberUtil.calculateNextLevelExp(user.level, user.exp));

	if(admin)
		embed.addField("Exp Adjustments", `${user.expAdjustment}`);
	
	embed.addField("Ð (Currency)", `${user.currency}`);

	if(admin) {
		//embed.addField("Rank (unused)", `${user.rank}`);
		//embed.addField("Class (unused)", `${user.class}`);
		embed.addField("Messages", `${user.messages}`, true);
		embed.addField("Reactions", `${user.reactions}`, true);
		embed.addField("Events", `${user.events}`, true);
		embed.addField("Voice Activity", `${user.voiceActivity}`, true);
		embed.addField("Trivia Answers", `${user.triviaCorrect}`, true);
		embed.addField("Trivia Wins", `${user.triviaWon}`, true);
		embed.addField("Battle Royale Wins", `${user.brWins}`, true);
		embed.addField("Last Online", `${user.lastOnline}\n*${new DateDiff(now, user.lastOnline).days()} days ago*`);
		embed.addField("Last Active", `${user.lastActive}\n*${new DateDiff(now, user.lastActive).days()} days ago*`);
		//embed.addField("Last Online", `${user.lastOnline.toLocaleDateString("en-US", options)}\n*${new DateDiff(now, user.lastOnline).days()} days ago*`);
		//embed.addField("Last Active", `${new Date(user.lastActive).toLocaleDateString("en-US", options)}\n*${new DateDiff(now, user.lastActive).days()} days ago*`);
	}

	//embed.addField("Activity Points", `${user.activityPoints}`, true);

	embed.setFooter(`Joined ${user.joined} (${new DateDiff(now, user.joined).days()} days ago)`);
	embed.setThumbnail(member.user.avatarURL);

	if(embedColor != "DEFAULT") {
		embed.setColor(embedColor);
	}
	

	return embed;
}
