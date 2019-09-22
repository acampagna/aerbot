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
const HandleActivity = require("./HandleActivity");
require('./models/server.js')();
require('./models/group.js')();
require('./models/user.js')();
require('./models/guild.js')();
require('./models/spotlight.js')();
const ServerModel = mongoose.model('Server');
const UserModel = mongoose.model('User');
const GachaGameService = require("./services/GachaGameService");
const InternalConfig = require("./internal-config.json");
const Group = mongoose.model('Group');

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", ServerModel);
const cmdPrefix = InternalConfig.commandPrefix;

var mainGuild;

client.on("beforeLogin", () => {
	setInterval(doServerIteration, Config.onlineIterationInterval);
});
client.on("message", message => {
	//TODO: Should only do then on non-bot commands
	if (message.guild && message.member && !message.member.user.bot && message.content.substring(0, 1) !== cmdPrefix)
		UserModel.findById(message.member.id).exec()
        	.then(userData => HandleActivity(
				client,
				message.member.id, 
				message,
				false,
				userData || newUser(message.member.id, message.member.displayName)
			)
		);
});

client.on("messageReactionAdd", (messageReaction, user) => {
	CoreUtil.dateLog(`Reaction Added: ${messageReaction} - ${user.id}`);
	if (messageReaction && user && !user.bot)
		UserModel.findById(user.id).exec()
        	.then(userData => HandleActivity(
				client,
				user.id, 
				false,
				messageReaction,
				userData || newUser(message.member.id, message.member.displayName)
			)
		);
});

client.on("messageReactionAdd", (messageReaction, user) => {
	CoreUtil.dateLog(`Reaction Added: ${messageReaction} - ${user.id}`);
	if (messageReaction && user && !user.bot)
		UserModel.findById(user.id).exec()
        	.then(userData => HandleActivity(
				client,
				user.id, 
				false,
				messageReaction,
				userData || newUser(message.member.id, message.member.displayName)
			)
		);
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	
	if(data.user_id === "524905193372909579") return;

	console.log(event);

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
						msgText = "Hey " + member.displayName + "! You tried to join **" + group.name + "** but are already a member. If you intended to leave the group then please remove your reaction that triggered this message.";
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
		let doc = ServerModel.upsert({_id: server.id});

		if(server.id === "524900292836458497") {
			mainGuild = server;
		}
	});
});

client.on("voiceStateUpdate", member => {

});

client.on("guildMemberAdd", (member) => {
	if(!member.user.bot) {
		CoreUtil.dateLog("Sending welcome message to " + member.user.username);
		//Need to make this a command or configuration
		member.send("@everyone Welcome to the Dauntless Gaming Community! Please read the `welcome-readme` channel at the top of our Discord server. It will explain everything you need to get started in Dauntless!");

		client.serverModel.findById(member.guild.id).exec().then(server =>{
			CoreUtil.dateLog("Adding welcome role to " + member.user.username);
			CoreUtil.dateLog(server.welcomeRole);
			member.addRole(server.welcomeRole);
			CoreUtil.aerLog(client,member.user.username + " joined the server and was assigned the welcome role.");
		});
	}
});

client.bootstrap();

function doServerIteration() {
	CoreUtil.dateLog(`[Online Interval]`);
	client.guilds.forEach(server => {
		//checkOnlineStatus(server);

		if(server.id === "524900292836458497") {
			mainGuild = server;
		}

		server.members.forEach(member =>{
			if(member.presence.status != "offline" && !member.user.bot) {
				CoreUtil.dateLog(`Updating ${member.displayName} - ${member.presence.status}`);
				UserModel.findById(member.id).exec()
				.then(userData => HandleActivity(
					client,
					member.id, 
					false,
					false,
					userData || newUser(member.id, member.displayName)
				));
			}
		});
	})
}

function checkOnlineStatus(server) {
	//Need to move stuff from doServerIteration into here
}

function newUser(uid, name) {
    CoreUtil.dateLog(`Creating ${uid} - ${name}`);
    return UserModel.create({ _id: uid, username: name });
}