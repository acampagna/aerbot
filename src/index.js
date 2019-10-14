/**
 * Construct a new Discord.Client with some added functionality
 * NEEDS TO BE CLEANED UP. NEEDS TO BE COMBINED WITH Client.js. BASED ON index.js FROM OLD AERBOT v1. BASED ON index.js FROM SOME TUTORIAL BOT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
// @ts-ignore
const Client = require("./Client.js");
const Config = require("./config.json");
const CoreUtil = require("./utils/Util.js");
const mongoose = require('mongoose');
const DateDiff = require("date-diff");
require('./models/monthlyActivity.js')();
require('./models/weeklyActivity.js')();
require('./models/dailyActivity.js')();
require('./models/server.js')();
require('./models/group.js')();
require('./models/user.js')();
require('./models/guild.js')();
require('./models/aerbot.js')();
const HandleActivity = require("./HandleActivity");
const ServerModel = mongoose.model('Server');
const UserModel = mongoose.model('User');
const GachaGameService = require("./services/GachaGameService");
const InternalConfig = require("./internal-config.json");
const Group = mongoose.model('Group');
const Aerbot = mongoose.model('Aerbot');
const DailyActivity = mongoose.model('DailyActivity');
const WeeklyActivity = mongoose.model('WeeklyActivity');
const MonthlyActivity = mongoose.model('MonthlyActivity');

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", ServerModel);
const cmdPrefix = InternalConfig.commandPrefix;

var mainGuild;
var qotdChanId;

client.on("beforeLogin", () => {
	setInterval(doServerIteration, Config.onlineIterationInterval);
	setInterval(doVoiceChannelScan, Config.voiceIterationInterval);
	setInterval(doActivityConversion, Config.activityIterationInterval);

	doActivityConversion();
});
client.on("message", message => {
	//TODO: Should only do then on non-bot commands
	if (message.guild && message.member && !message.member.user.bot && message.content.substring(0, 1) !== cmdPrefix && message.channel.id != "630032620331335690" && message.channel.id != "628947427466149888") {
		UserModel.findById(message.member.id).exec()
        	.then(userData => HandleActivity(
				client,
				message.guild,
				{message: message},
				userData || newUser(message.member.id, message.member.displayName)
			)
		);

		if(message.channel.id === qotdChanId) {
			ServerModel.findById(message.guild.id).exec().then(serverData => {
				var msgDeleted = false;
				var first = true;
				//console.log(serverData.msgsSinceNewQotd);
				var limit = serverData.msgsSinceNewQotd;
				if(limit === 0) {
					limit = 1;
				}
				message.channel.fetchMessages({ limit: limit }).then(msgs => {
					//console.log(msgs.array().length);
					msgs.array().forEach(msg =>{
						if(msg.author.id === message.author.id && !msg.deleted && !first) {
							message.delete();
							msgDeleted = true;
						}
						first = false;
					});
					if(!msgDeleted) {
						serverData.incMsgsSinceNewQotd();
						message.channel.fetchMessage(serverData.qotdMessageId).then(message => {
							message.delete();
							CoreUtil.sendQotd(serverData.qotd, client, serverData);
						}).catch(console.error);
					}
				}).catch(console.error);
			}).catch(console.error);
		}
	}
});

client.on("messageReactionAdd", (messageReaction, user) => {
	CoreUtil.dateLog(`Reaction Added: ${messageReaction} - ${user.id}`);
	if (messageReaction && user && !user.bot)
		UserModel.findById(user.id).exec()
        	.then(userData => HandleActivity(
				client,
				messageReaction.message.guild,
				{reaction: messageReaction},
				userData || newUser(user.id, user.username)
			)
		);
});

client.on("messageReactionRemove", (messageReaction, user) => {
	CoreUtil.dateLog(`Reaction Removed: ${messageReaction} - ${user.id}`);
	if (messageReaction && user && !user.bot)
		UserModel.findById(user.id).exec()
		.then(userData => {
			userData.reactions--;
			userData.activityPoints--;
			userData.exp = userData.exp - 5;
			userData.save();
		});
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	
	if(data.user_id === "524905193372909579") return;

    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id);

	const message = await channel.fetchMessage(data.message_id);
	
	if(message.guild) {
		var tmpMember = message.guild.members.get(user.id);
		var tmpGuild = message.guild;
	} else {
		var tmpMember = mainGuild.members.get(user.id);
		var tmpGuild = mainGuild;
	}

	const member = tmpMember;
	const eventGuild = tmpGuild;

	if (message.author.id === client.user.id) {
		if (member.id !== client.user.id) {
			//console.log(data.emoji.id);
			Group.findGroupByEmoji(data.emoji.id).then(async group => {
				if(group) {
					//console.log(group);
					var role = eventGuild.roles.find(role => role.name.toLowerCase().trim() === group.name.toLowerCase().trim());
					var alreadyGroupMember = (member.roles.find(role => role.name.toLowerCase().trim() === group.name.toLowerCase().trim()));

					var msgText = "";

					if (event.t === "MESSAGE_REACTION_ADD") {
						if(!alreadyGroupMember) {
							member.addRole(role);
							group.incrementNumMembers();
							group.addMember(group.name,member.id);
							msgText = "Hey " + member.displayName + "! I just added you to the **" + group.name + "** group.";
							//channel.send("Added @" + member.displayName + " to group " + group.name);
							CoreUtil.aerLog(client,member.displayName + " joined " + group.name);
						} else {
							msgText = "Hey " + member.displayName + "! You tried to join **" + group.name + "** but are already a member.";
						}
						
					} else if (event.t === "MESSAGE_REACTION_REMOVE" && alreadyGroupMember) {
						member.removeRole(role);
						group.decrementNumMembers();
						group.removeMember(group.name,member.id);
						CoreUtil.aerLog(client,member.displayName + " left " + group.name);
						//channel.send("Removed @" + member.displayName + " from group " + group.name);
						msgText = "Hey " + member.displayName + "! I just removed you from the **" + group.name + "** group.";
					}


					//TODO: NEEDS TO BE REFACTORED! I need to make promises work properly. Currently in a rush for a community deadline.
					if(group.platforms.length > 0 && event.t === "MESSAGE_REACTION_ADD" && !alreadyGroupMember) {
						console.log("platforms > 0");
						if(group.platforms.length === 1) {
							Group.findGroupById(group.platforms[0]).then(platformGroup => {
								console.log("platforms === 1");
								var role2 = eventGuild.roles.find(role => role.name.toLowerCase().trim() === platformGroup.name.toLowerCase().trim());

								if(!member.roles.find(role => role.name.toLowerCase().trim() === platformGroup.name.toLowerCase().trim())) {
									member.addRole(role2);
									platformGroup.incrementNumMembers();
									platformGroup.addMember(platformGroup.name,member.id);
									msgText += "\nI've also automatically added you to the **" + platformGroup.name + " platform group because it's related to **" + group.name + "**";	
								}

								member.send(msgText);
							}).catch(console.error);
						} else if(event.t === "MESSAGE_REACTION_ADD"){
							var platforms = new Map();
							//TODO: Should refactor to query all platforms at once
							group.platforms.forEach( platform => {
								platforms.set(platform, {});
							});

							let platformsData = await Group.find( { _id: { $in : Array.from(platforms.keys()) } }).exec();

							//console.log(platformsData);
							msgText += "\nWould you also like to join one of **" + group.name + "'s** associated platform groups? If so, click on the appropriate reaction below to join.\n";

							platformsData.forEach(data => {
								platforms.set(data.id, data);
								let emoji = client.emojis.get(data.emoji);
								msgText += "\n" + emoji + " : " + data.name;
							});

							member.send(msgText).then(function (message) {
								platformsData.forEach(data => {
									message.react(data.emoji);
								});
							}).catch(function() {
								//Something
							});
						} else {
							member.send(msgText);
						}
					} else {
						member.send(msgText);
					} 
				}
			}).catch(err => {
				console.error(err);
			});
		}
	}
});

client.on("ready", () => {
	CoreUtil.dateLog('ready');
	var ggs = new GachaGameService();
	client.guilds.forEach(server => {
		//CoreUtil.dateLog(server);
		ServerModel.upsert({_id: server.id}).then(doc => {
			if(server.id === "524900292836458497") {
				qotdChanId = doc.qotdChannelId;
				console.log(qotdChanId);
			}
		});

		if(server.id === "524900292836458497") {
			mainGuild = server;
		}
	});

	//doVoiceChannelScan();
});

client.on("voiceStateUpdate", member => {

});

client.on("guildMemberAdd", (member) => {
	if(!member.user.bot) {
		CoreUtil.dateLog("Sending welcome message to " + member.user.username);
		var aerMem = mainGuild.members.get("151473524974813184");
		//Need to make this a command or configuration
		member.send("**Welcome to the Dauntless Gaming Community!**\n\nPlease stick around with us as we are still setting up and preparing for our official launch on Oct 12. At that point we should start to grow quite quickly. "
		+ "If you have any questions, comments, or suggestions please feel free to message any of our staff.");
		//+ "\n\n > If you decide to leave: __Please__ message " + aerMem + " before you do and let us know you're unhappy here. Your feedback would be greatly appreciated and will help future members of Dauntless!"
		//+ "\n > If you're here to spam your own Discord server, stream, website, etc please just message " + aerMem + " and we can discuss a potential partnership or advertisement swap!");
		
		client.serverModel.findById(member.guild.id).exec().then(server => {
			var welcomeChannel = client.channels.get(server.welcomeChannelId);
			//var introChannel = client.channels.get(server.introChannelId);
			client.channels.get(server.publicChannelId).send("Welcome " + member + " to the Dauntless Gaming Community! Please read the " + welcomeChannel + " channel. It will explain everything you need to get started in Dauntless!");
			member.addRole(server.welcomeRole);
			CoreUtil.aerLog(client,member.user.username + " joined the server and was assigned the welcome role.");
		});
	}
});

client.on("guildMemberRemove", (member) => {
	if(!member.user.bot) {
		CoreUtil.aerLog(client,member.user.username + " left the server. :(");
	}
});

client.bootstrap();

async function doServerIteration() {
	CoreUtil.dateLog(`[Online Interval]`);
	client.guilds.forEach(server => {
		//checkOnlineStatus(server);

		if(server.id === "524900292836458497") {
			mainGuild = server;
		}

		client.serverModel.findById(server.id).exec().then(serverData => {
			CoreUtil.asyncForEach(server.members.array(), async (member) => {
				if(member.presence.status != "offline" && !member.user.bot) {
					CoreUtil.dateLog(`Updating ${member.displayName} - ${member.presence.status}`);
					UserModel.findById(member.id).exec().then(userData => { 
						console.log(new DateDiff(new Date(), new Date(userData.joined)).days());
	
						if(new DateDiff(new Date(), new Date(userData.joined)).days() >= 14) {
							console.log(member.displayName + " joined over 14 days ago!");
							if(member.roles.find(role => role.id === serverData.welcomeRole)) {
								console.log(member.displayName + " is also in the welcome role! Removing Welcome Role & Adding Member Role.");
								//member.removeRole(serverData.welcomeRole);
								//member.addRole(serverData.memberRoleId);
							}
						}
						HandleActivity(client,server,{},userData || newUser(member.id, member.displayName));
					});
					await CoreUtil.waitFor(500);
				}
			});
		});
	})
}

async function doVoiceChannelScan() {
	CoreUtil.dateLog(`[Voice Interval]`);
	const channels = client.guilds.get("524900292836458497").channels.filter(c => c.type === 'voice' && c.name.toLowerCase() != "afk");

	for (const [channelID, channel] of channels) {
		//console.log("Channel " + channelID + " " + channel.name);
		for (const [memberID, member] of channel.members) {
			//console.log("Member " + memberID + " " + member.user.username);
			UserModel.findById(memberID).exec().then(userData => {
				if(userData) {
					HandleActivity(client,client.guilds.get("524900292836458497"),{voice: true},userData || newUser(user.id, user.username));
				}
			});
		}
	}
}

async function doActivityConversion() {
	CoreUtil.dateLog(`[Activity Interval]`);
	var userActivity = new Map();
	var expectedDocs = 0;
	var lastDailyToWeekly;
	var lastWeeklyToMonthly;

	Aerbot.get("lastDailyToWeeklyActivityConversion").then(meta => {
		lastDailyToWeekly = new Date(meta.value);
		
		//console.log(meta);
		//console.log(lastDailyToWeekly);
		
		console.log("Daily to Weekly Hours: " + new DateDiff(new Date(), lastDailyToWeekly).hours());
		//console.log("Daily to Weekly Days: " + new DateDiff(new Date(), lastDailyToWeekly).days());

		/*if(new DateDiff(new Date(), new Date(lastDailyToWeekly)).hours() >= 24) {
			Aerbot.set("lastDailyToWeeklyActivityConversion", new Date());
			DailyActivity.findAllActivity().then(activities => {
				activities.forEach(activity =>{
					var uid = activity.userId;
					var type = activity.type;
					var xp = activity.exp;

					if(userActivity.has(uid)) {
						var ua = userActivity.get(uid);
						ua.has(type) ? ua.set(type, ua.get(type)+xp) : ua.set(type, xp);
					} else {
						userActivity.set(uid, new Map([[type,xp]]));
					}
				});

				userActivity.forEach(function(activityMap, userId) {
					expectedDocs += activityMap.size;
					WeeklyActivity.addMap(userId, activityMap);
				});

				console.log(userActivity);
				DailyActivity.deleteMany({}).exec();
			});
		}*/

		Aerbot.get("lastWeeklyToMonthlyActivityConversion").then(meta => {
			lastWeeklyToMonthly = new Date(meta.value);
	
			//console.log(meta);
			//console.log(lastWeeklyToMonthly);
	
			console.log("Weekly to Monthly Hours: " + new DateDiff(new Date(), lastWeeklyToMonthly).hours());
			//console.log("Weekly to Monthly Days: " + new DateDiff(new Date(), lastWeeklyToMonthly).days());
	
			/*if(new DateDiff(new Date(), new Date(lastWeeklyToMonthly)).hours() >= 168) {
				//Aerbot.set("lastWeeklyToMonthlyActivityConversion", new Date());
				WeeklyActivity.findAllActivity().then(activities => {
					activities.forEach(activity =>{
						var uid = activity.userId;
						var type = activity.type;
						var xp = activity.exp;
	
						if(userActivity.has(uid)) {
							var ua = userActivity.get(uid);
							ua.has(type) ? ua.set(type, ua.get(type)+xp) : ua.set(type, xp);
						} else {
							userActivity.set(uid, new Map([[type,xp]]));
						}
					});
	
					userActivity.forEach(function(activityMap, userId) {
						expectedDocs += activityMap.size;
						MonthlyActivity.addMap(userId, activityMap);
					});
	
					console.log(userActivity);
					//WeeklyActivity.deleteMany({}).exec();
				});
			}*/
		});
	});
}

function checkOnlineStatus(server) {
	//Need to move stuff from doServerIteration into here
}

function newUser(uid, name) {
    CoreUtil.dateLog(`Creating ${uid} - ${name}`);
    return UserModel.create({ _id: uid, username: name });
}