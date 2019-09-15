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
const ServerModel = mongoose.model('Server');
const UserModel = mongoose.model('User');
const GachaGameService = require("./services/GachaGameService");
const InternalConfig = require("./internal-config.json");
const Group = mongoose.model('Group');

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", ServerModel);
const cmdPrefix = InternalConfig.commandPrefix;

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
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id);

    const message = await channel.fetchMessage(data.message_id);
    const member = message.guild.members.get(user.id);
	
	console.log(event);

	if (message.author.id === client.user.id) {
		if (member.id !== client.user.id) {
			console.log(data.emoji.id);
			Group.findGroupByEmoji(data.emoji.id).then(group => {
				console.log(group);
				if (event.t === "MESSAGE_REACTION_ADD") {
					channel.send("Added @" + member.displayName + " to group " + group.name);
				} else if (event.t === "MESSAGE_REACTION_REMOVE") {
					channel.send("Removed @" + member.displayName + " from group " + group.name);
				}
				 				
			}).catch(err => {
				console.error(err);
			});
		}
	}

	/*if (
        (message.author.id === client.user.id) && (message.content !== CONFIG.initialMessage || 
        (message.embeds[0] && (embedFooterText !== CONFIG.embedFooter)))
    ) {
		if (member.id !== client.user.id) {
			const guildRole = message.guild.roles.find(r => r.name === role);
			if (event.t === "MESSAGE_REACTION_ADD") member.addRole(guildRole.id);
			else if (event.t === "MESSAGE_REACTION_REMOVE") member.removeRole(guildRole.id);
		}
    }*/

	//console.log(emojiKey);
	//console.log(reaction);
	//console.log(event);
});

client.on("ready", () => {
	CoreUtil.dateLog('ready');
	var ggs = new GachaGameService();
	client.guilds.forEach(server => {
		//CoreUtil.dateLog(server);
		let doc = ServerModel.upsert({_id: server.id})
	});
});

client.on("voiceStateUpdate", member => {

});

client.on("serverMemberAdd", (member) => {
	if(!member.user.bot) {
		//CoreUtil.dateLog("Sending welcome message to " + member.user.username);
		//Need to make this a command or configuration
		/*member.send("Welcome to the Dauntless gaming server! Please read the `welcome-readme` channel at the top of our Discord server. It will explain everything you need to get started in Dauntless!");
		CoreUtil.dateLog("Sent welcome message to " + member.user.username);
		client.serverModel.findById(member.server.id).exec().then(server =>{
			CoreUtil.dateLog("Adding welcome role to " + member.user.username);
			CoreUtil.dateLog(server.welcomeRole);
			member.addRole(server.welcomeRole);
			CoreUtil.dateLog("Role added to " + member.user.username);
		});*/
	}
});

client.bootstrap();

function doServerIteration() {
	CoreUtil.dateLog(`[Online Interval]`);
	client.guilds.forEach(server => {
		//checkOnlineStatus(server);
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