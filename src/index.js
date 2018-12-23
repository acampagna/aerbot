// @ts-ignore
const Client = require("./Client.js");
const Config = require("./config.json");
const CoreUtil = require("./utils/Util.js");
const mongoose = require('mongoose');
const HandleActivity = require("./HandleActivity");
require('./models/guild.js')();
require('./models/group.js')();
require('./models/user.js')();
const GuildModel = mongoose.model('Guild');
const UserModel = mongoose.model('User');

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", GuildModel);

client.on("beforeLogin", () => {
	setInterval(doGuildIteration, Config.onlineIterationInterval);
});
client.on("message", message => {
	if (message.guild && message.member && !message.member.user.bot)
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

client.on("ready", () => {
	CoreUtil.dateLog('ready');
	client.guilds.forEach(guild => {
		let doc = GuildModel.upsert({_id: guild.id})
	});
});

client.on("voiceStateUpdate", member => {

});

client.on("guildMemberAdd", (member) => {
	member.send("Welcome to the Dauntless gaming server!");
	if(!member.user.bot) {
		client.guildModel.findById(member.guild.id).exec().then(guild =>{
			member.addRole(guild.welcomeRole);
		});
	}
});

client.bootstrap();

function doGuildIteration() {
	CoreUtil.dateLog(`[Online Interval]`);
	client.guilds.forEach(guild => {
		//checkOnlineStatus(guild);
		guild.members.forEach(member =>{
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

function checkOnlineStatus(guild) {

	/*//REMOVE AFTER A WEEK
	UserData.findOne({ user_id: member.id }).then(userData => {
		if(userData && userData.lotteries === 0) {
			CoreUtil.dateLog(member.displayName + " has 0 lotteries!");
			LotteryEntryData.count({ user_id: member.id }).then(count => {
				CoreUtil.dateLog("Total lotteries: " + count);
				userData.lotteries = count;
				userData.save();
			});
		}
	});*/

	/*guild.members.forEach(member =>{
		if(member.presence.status != "offline") {
			CoreUtil.dateLog(`Updating ${member.displayName} - ${member.presence.status}`);
			UserData.findOne({ user_id: member.id })
				.then(userData => HandleActivity(
					client,
					member.id, 
					false,
					false,
					userData || newUser(member.id, member.displayName)
				)
			);
		}
	});*/
}

function newUser(uid, name) {
    CoreUtil.dateLog(`Creating ${uid} - ${name}`);
    return UserModel.create({ _id: uid, username: name });
}