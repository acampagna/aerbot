/**
 * Construct a new Discord.Client with some added functionality
 * NEEDS TO BE CLEANED UP. NEEDS TO BE COMBINED WITH Client.js. BASED ON index.js FROM OLD AERBOT v1. BASED ON index.js FROM SOME TUTORIAL BOT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
// @ts-ignore
import { Aerbot } from './Aerbot'
const Config = require("./config.json");
const CoreUtil = require("./utils/Util.js");
const mongoose = require('mongoose');
const HandleActivity = require("./HandleActivity");
require('./models/guild.js')();
require('./models/group.js')();
require('./models/user.js')();
const GuildModel = mongoose.model('Guild');
const UserModel = mongoose.model('User');
const GachaGameService = require("./services/GachaGameService");
const InternalConfig = require("./internal-config.json");

const aerbot:Aerbot = new Aerbot(require("../token.json"), __dirname + "/commands", GuildModel);
aerbot.start();
const cmdPrefix = InternalConfig.commandPrefix;

aerbot.client.on("beforeLogin", () => {
	setInterval(doGuildIteration, Config.onlineIterationInterval);
});
aerbot.client.on("message", message => {
	//TODO: Should only do then on non-bot commands
	if (message.guild && message.member && !message.member.user.bot && message.content.substring(0, 1) !== cmdPrefix)
		UserModel.findById(message.member.id).exec()
        	.then(userData => HandleActivity(
				aerbot.client,
				message.member.id, 
				message,
				false,
				userData || newUser(message.member.id, message.member.displayName)
			)
		);
});

aerbot.client.on("messageReactionAdd", (messageReaction, user) => {
	CoreUtil.dateLog(`Reaction Added: ${messageReaction} - ${user.id}`);
	if (messageReaction && user && !user.bot)
		UserModel.findById(user.id).exec()
        	.then(userData => HandleActivity(
				aerbot.client,
				user.id, 
				false,
				messageReaction,
				userData || newUser(messageReaction.message.member.id, messageReaction.message.member.displayName)
			)
		);
});

aerbot.client.on("ready", () => {
	CoreUtil.dateLog('ready');
	var ggs = new GachaGameService();
	aerbot.client.guilds.forEach(guild => {
		//CoreUtil.dateLog(guild);
		let doc = GuildModel.upsert({_id: guild.id})
	});
});

aerbot.client.on("voiceStateUpdate", member => {

});

aerbot.client.on("guildMemberAdd", (member) => {
	if(!member.user.bot) {
		CoreUtil.dateLog("Sending welcome message to " + member.user.username);
		//Need to make this a command or configuration
		member.send("Welcome to the Dauntless gaming server! Please read the `welcome-readme` channel at the top of our Discord server. It will explain everything you need to get started in Dauntless!");
		CoreUtil.dateLog("Sent welcome message to " + member.user.username);
		aerbot.guildModel.findById(member.guild.id).exec().then(guild =>{
			CoreUtil.dateLog("Adding welcome role to " + member.user.username);
			CoreUtil.dateLog(guild.welcomeRole);
			member.addRole(guild.welcomeRole);
			CoreUtil.dateLog("Role added to " + member.user.username);
		});
	}
});

aerbot.bootstrap();

function doGuildIteration() {
	CoreUtil.dateLog(`[Online Interval]`);
	aerbot.client.guilds.forEach(guild => {
		//checkOnlineStatus(guild);
		guild.members.forEach(member =>{
			if(member.presence.status != "offline" && !member.user.bot) {
				CoreUtil.dateLog(`Updating ${member.displayName} - ${member.presence.status}`);
				UserModel.findById(member.id).exec()
				.then(userData => HandleActivity(
					aerbot.client,
					member.id, 
					false,
					false,
					userData || newUser(member.id, member.displayName)
				));
			}
		});
	})
}

function checkOnlineStatus(guild) {
	//Need to move stuff from doGuildIteration into here
}

function newUser(uid, name) {
    CoreUtil.dateLog(`Creating ${uid} - ${name}`);
    return UserModel.create({ _id: uid, username: name });
}