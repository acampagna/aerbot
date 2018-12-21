// @ts-ignore
const Client = require("./Client.js");
const Config = require("./config.json");
const GuildData = require("./models/guild-data.js");
const UserData = require("./models/user-data.js");
const CoreUtil = require("./utils/Util.js");
const LotteryUtil = require("./utils/LotteryUtil.js");
const HandleActivity = require("./HandleActivity");
const DateDiff = require("date-diff");
const mongoose = require('mongoose');
require('./models/guild.js')();
const Guild = mongoose.model('Guild');

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", GuildData);

client.on("beforeLogin", () => {
	//setInterval(doGuildIteration, Config.onlineIterationInterval);
});

client.on("message", message => {
	if (message.guild && message.member)
		UserData.findOne({ user_id: message.member.id })
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
	if (messageReaction && user)
		UserData.findOne({ user_id: user.id })
        	.then(userData => HandleActivity(
				client,
				user.id, 
				false,
				messageReaction,
				userData || newUser(user.id, user.username)
			));
});

client.on("ready", () => {
	CoreUtil.dateLog('ready');
	client.guilds.forEach(guild => {
		//var tmpGuild = Guild.create({_id: guild.id});
		//CoreUtil.dateLog('tmpGuild');
		//tmpGuild.updateOfficerRoleId("fsafsd");
		let doc = Guild.upsert({_id: guild.id}).then(doc => {
			CoreUtil.dateLog(doc);
			doc.updateMemberRoleId('f1231321312', function (err) {
				if (err) return console.log(err);
			});
		});
	});
});

// client.on("voiceStateUpdate", member => {
//     GuildData.findOne({ guildID: member.guild.id })
//         .then(guildData => registerActivity(member.guild, member, guildData));
// });

client.bootstrap();

function doGuildIteration() {
	/*CoreUtil.dateLog(`[Interval]`);
	client.guilds.forEach(guild => {
		checkOnlineStatus(guild);
		GuildData.findOne({ guildID: guild.id}).then(guildData => {
			let now = new Date();

			if(!guildData.lastLotteryAnnounce) {
				CoreUtil.dateLog("Last Announce Time SET");
				guildData.lastLotteryAnnounce = now;
				guildData.save();
			}

			let lotteryDateDiff = new DateDiff(now, guildData.lastLotteryAnnounce);

			if(lotteryDateDiff.seconds()*1000 >= Config.autoAnnounceInterval) {
				if(guild.channels.get(guildData.lotteryChannel)) {
					LotteryUtil.announce(guildData).then(m => {
						guild.channels.get(guildData.lotteryChannel).send("@everyone", { embed: m });
					});
				}
			}

			if(!guildData.lastTip) {
				CoreUtil.dateLog("Last Tip Time SET");
				guildData.lastTip = now;
				guildData.save();
			}

			let tipDateDiff = new DateDiff(now, guildData.lastTip);

			if(tipDateDiff.seconds()*1000 >= Config.tipInterval) {
				if(guild.channels.get(guildData.lotteryChannel)) {
					let tips = Config.tips;
					let formats = Config.formats;
					let rnd = Math.floor(Math.random()*tips.length);
					let tipNum = rnd+1;

					guildData.lastTip = now;
					guildData.save();

					let rndFormat = 0;
					if(!tips[rnd].includes("http://") && !tips[rnd].includes("https://")) {
						rndFormat = Math.floor(Math.random()*formats.length);
					}

					//guild.channels.get(guildData.tipChannel).send("**** ```" + tips[rnd] + "```");
					guild.channels.get(guildData.tipChannel).send(CoreUtil.doFormatting(
						formats[rndFormat],
						{
							"one": "Did you know (Tip #" + tipNum + ")",
							"two": tips[rnd]
						}
					));
				}
			}
		});
	})*/
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
	return UserData.create({ user_id: uid, username: name });
}