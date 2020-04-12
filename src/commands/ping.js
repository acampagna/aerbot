const CoreUtil = require("../utils/Util.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const mongoose = require('mongoose');
const Command = require("../Command.js");
const Discord = require("discord.js");
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const Activity = mongoose.model('Activity');
const MessageQueueService = require("../services/MessageQueueService");
const MemberFetchingService = require("../services/MemberFetchingService");
const Twit = require('twit');
var Jimp = require('jimp');

const MFS = new MemberFetchingService();
const MQS = new MessageQueueService();

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
async function invoke({ message, params, serverData, client }) {
	/*var nparams4 = params.join(" ").split(/"((?:\\.|[^"\\])*)"/);
	var nparams3 = new Map(
		params.slice(1).join(" ").split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/\"/g, "").split(":").map(m => m.trim())).map(([k, v]) => [k.toLowerCase(), v])
	);
	var nparams2 = params.join(" ").split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	var nparams =  params.join(" ").split(/,(["'])(?:(?=(\\?))\2.)*?\1/);

	console.log(message);
	console.log(nparams);
	console.log(nparams2);
	console.log(nparams3);
	console.log(nparams4);*/

	/*User.findById(message.member.id).exec().then(userData => { 
		console.log("Loaded user");
		console.log(message.member.presence.game);
		if(message.member.presence.game && message.member.presence.game.name && message.member.presence.game.applicationID) {
			console.log("Proper game presence is set!");
			userData.addLatestGame(message.member.presence.game.name);

			//Pulling Group for Game
			Group.findGroupByAppId(message.member.presence.game.applicationID).then(async group => {
				if(group) {
					//console.log(group);
					var role = message.guild.roles.find(role => role.name.toLowerCase().trim() === group.name.toLowerCase().trim());
					var alreadyGroupMember = (message.member.roles.find(role => role.name.toLowerCase().trim() === group.name.toLowerCase().trim()));
					var memberRole = message.guild.roles.get("524900839651803157");
					var alreadyMember = message.member.roles.get("524900839651803157");

					var channel = message.guild.channels.get(group.channelId);

					if(!alreadyMember) {
						message.member.addRole(memberRole);
					}

					if(!alreadyGroupMember) {
						message.member.addRole(role);
						group.incrementNumMembers();
						group.addMember(group.name,message.member.id);
						console.log(message.member.displayName + " is not yet in " + group.name + " group! Adding them.");
						CoreUtil.aerLog(client,message.member.displayName + " automatically added to " + group.name);
						message.member.send("Hey " + message.member.displayName + "! We noticed you playing " + group.name + " and automatically added you to that group. You now have access to the " + channel + " channel in __Dauntless Gaming Community__!");
					} else {
						console.log(message.member.displayName + " is already in " + group.name + " group!");
					}
				}
			});
		}
	});*/

	// var role = message.guild.roles.get("536619177994092549");
	// var listSwitchMembers = MFS.getMembersInRole(role);
	// //id
	// var listInactive = await MFS.getInactiveMembers();
	// //_id
	// var results = new Array();
	
	// listSwitchMembers.forEach(m => {
	// 	const result = listInactive.find( ({ _id }) => _id === m.id );
	// 	if(result) {
	// 		results.push(result._id);
	// 	} else {
	// 		if(m.username) {
	// 			console.log(m.username + " is active");
	// 		} else {
	// 			console.log(m.id + " is active");
	// 		}
	// 	}
	// });

	// console.log(results.length);

	// var recentActive = await Activity.findAllRecentActivityIn(results);

	// console.log(recentActive);

	// /*var date = new Date('January 1, 2020 00:00:00');
	// console.log(date);
	// var list = MFS.getMembersInactiveSince(date);*/

	/*Jimp.read("res/tmp/DARK_SOULS_III_4_6_2020_12_16_20_AM_OLD.png")
	.then(image => {
		console.log(image.getMIME());
		//image.quality(70).deflateLevel(30).writeAsync("res/tmp/DARK_SOULS_III_4_6_2020_12_16_20_AM.png").then(() => {});
		console.log(image.bitmap.width + "x" + image.bitmap.height);
		image.write("res/tmp/DARK_SOULS_III_4_6_2020_12_16_20_AM.png");
	})
	.catch(err => {
		// Handle an exception.
	});*/

	const embed = new Discord.RichEmbed();
	embed.setColor("RANDOM");
	embed.setTitle(`PING?`);
	embed.setDescription("PONG!");

	return Promise.resolve(DiscordUtil.processEmbed(embed, client));
}