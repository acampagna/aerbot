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
const DiscordUtil = require("./utils/DiscordUtil.js");
const MemberUtil = require("./utils/MemberUtil.js");
const mongoose = require('mongoose');
const DateDiff = require("date-diff");
require('./models/server.js')();
require('./models/group.js')();
require('./models/user.js')();
require('./models/guild.js')();
require('./models/aerbot.js')();
require('./models/war.js')();
require('./models/Prize.js')();
require('./models/warTeam.js')();
require('./models/Activity.js')();
require('./models/trivia.js')();
require('./models/achievement.js')();
require('./models/pinned.js')();
require('./models/storeItem.js')();
require('./models/storePurchase.js')();
require('./models/messageQueueItem.js')();
const Discord = require("discord.js");
const AccountService = require("./services/AccountService");
const StoreService = require("./services/StoreService");
const PinnedService = require("./services/PinnedService");
const TriviaService = require("./services/TriviaService");
const AchievementService = require("./services/AchievementService");
const MessageQueueService = require("./services/MessageQueueService");
const MemberFetchingService = require("./services/MemberFetchingService");
const NewMemberService = require("./services/NewMemberService");
const HolidayHunterService = require("./services/HolidayHunterService");
const BattleService = require("./services/BattleService");
const HandleActivity = require("./HandleActivity");
const ServerModel = mongoose.model('Server');
const UserModel = mongoose.model('User');
const GachaGameService = require("./services/GachaGameService");
const InternalConfig = require("./internal-config.json");
const Group = mongoose.model('Group');
const Aerbot = mongoose.model('Aerbot');
const Activity = mongoose.model('Activity');
const War = mongoose.model('War');
const Prize = mongoose.model('Prize');
const WarTeam = mongoose.model('WarTeam');
const Trivia = mongoose.model('Trivia');
const Achievement = mongoose.model('Achievement');
const Pinned = mongoose.model('Pinned');
const StoreItem = mongoose.model('StoreItem');
const MessageQueueItem = mongoose.model('MessageQueueItem');

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", ServerModel);
const cmdPrefix = InternalConfig.commandPrefix;

var mainGuild;
var qotdChanId;
const TS = new TriviaService();
const PS = new PinnedService();
const AS = new AchievementService();
const SS = new StoreService();
const ACTS = new AccountService();
const MQS = new MessageQueueService();
const MFS = new MemberFetchingService();
const NMS = new NewMemberService();
const BATTLE_SERVICE = new BattleService();
//const HHS = new HolidayHunterService();
//var msgRateLimiter = new Map();
var reactionRateLimiter = new Map();
var pendingRequests = new Map();

var invites;
const wait = require('util').promisify(setTimeout);

client.on("beforeLogin", () => {
	setInterval(doServerIteration, Config.onlineIterationInterval);
	setInterval(doVoiceChannelScan, Config.voiceIterationInterval);
	//setInterval(doSendMessages, Config.sendMessageInterval);
	setInterval(doNitroCheck, Config.nitroIterationInterval);

	//doActivityConversion();
});
client.on("message", message => {
	if (message.guild && message.member && !message.member.user.bot && message.content.substring(0, 1) !== cmdPrefix && message.content.length > 2 &&
	message.channel.id != "630032620331335690" && message.channel.id != "628947427466149888" && message.channel.id != "667697726766710794") {
		//Holiday Hunter
		//HHS.messageSent(client);
		
		if(SS.userHasPendingRequest(message.member.id)) {
			console.log("INDEX USER HAS PENDING REQUEST!");
			SS.handleRequestResponse(message, client);
		}

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
					console.log(msgs.array().length);
					msgs.array().forEach(msg =>{
						console.log("[" + msg.deleted + "] " + msg.content);
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
						console.log(message.member.displayName + " has answered the QOTD!");
						UserModel.findById(message.member.id).exec()
							.then(userData => HandleActivity(
								client,
								message.guild,
								{qotd: true},
								userData || newUser(message.member.id, message.member.displayName)
							)
						);
					}
				}).catch(console.error);
			}).catch(console.error);
		}
	}
});

client.on("messageReactionAdd", (messageReaction, user) => {

	/*var ts = Math.round((new Date()).getTime());

	var rateLimited = false;

	if(msgRateLimiter.has(message.member.id)) {
		console.log("msgRateLimiter", msgRateLimiter.get(message.member.id));
		if(ts - msgRateLimiter.get(message.member.id) >= 100) {
			msgRateLimiter.delete(message.member.id);
		}
	} else {
		userActivity.set(uid, new Map([[type,xp]]));
	}*/
	
	if (messageReaction && user && !user.bot && messageReaction.message.channel.type != "dm") {
		//console.log("Reaction Added!");
		//console.log(messageReaction);
		if(TS.getCurrentTriviaMessageId() && messageReaction.message.id === TS.getCurrentTriviaMessageId()) {
			//var msgReactions = messageReaction.message.reactions;
			messageReaction.remove(user.id);
			//console.log(messageReaction._emoji + " " + TS.getAnswerEmoji());
			//messageReaction.message.channel.send(messageReaction._emoji + " " + TS.getAnswerEmoji());

			if(messageReaction._emoji == TS.getAnswerEmoji()) {
				console.log("RIGHT ANSWER");
				TS.addUserFromAnsweredCorrectly(user.id);
			} else {
				console.log("WRONG ANSWER");
				if(TS.userAnsweredCorrectly(user.id)) { //this user already had the right answer
					TS.removeUserFromAnsweredCorrectly(user.id);
				}
			}
		} else if(BATTLE_SERVICE.getState() === 2 && BATTLE_SERVICE.isMessageBetMessage(messageReaction.message.id)) {
			BATTLE_SERVICE.addBet(messageReaction, user);
		} else {
			if(new DateDiff(new Date(), messageReaction.message.createdAt).days() < 1 || messageReaction._emoji.id === "538050181573378048") {
				UserModel.findById(user.id).exec()
				.then(userData => {
					if(userData.reactions < userData.messages) {
						/*CoreUtil.dateLog(`Reaction Added: ${messageReaction} - ${user.id}`);
						HandleActivity(
							client,
							messageReaction.message.guild,
							{reaction: messageReaction},
							userData || newUser(user.id, user.username)
						);*/
					}
				});
			}
		}
	}
});

client.on("messageReactionRemove", (messageReaction, user) => {
	if (messageReaction && user && !user.bot && messageReaction.message.channel.type != "dm") {
		if(TS.getCurrentTriviaMessageId() && messageReaction.message.id === TS.getCurrentTriviaMessageId()) {
			// Nothing right now
		} else if(BATTLE_SERVICE.getState() === 2 && BATTLE_SERVICE.isMessageBetMessage(messageReaction.message.id)) {
			BATTLE_SERVICE.removeBet(messageReaction, user);
		} else {
			UserModel.findById(user.id).exec()
			.then(userData => {
				if(userData.reactions > 50 && userData.reactions < userData.messages) {
					CoreUtil.dateLog(`Reaction Removed: ${messageReaction} - ${user.id}`);
					userData.reactions--;
					userData.activityPoints--;
					userData.exp = userData.exp - 5;
					userData.save();
				}
			});
		}
	}
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;

	//console.log(data);
	
	if(data.user_id === "524905193372909579") return;

    const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id);
	
	//console.log(channel);

	if(!data.guild_id) {
		//console.log("NOT CHANNEL!");
		if(data.emoji.name == "❌") {
			//console.log("USED X!");
			UserModel.byId(data.user_id).then(usr => {
				if(event.t === "MESSAGE_REACTION_ADD") {
					usr.unsubscribe();
					user.send("You've successfully unsubscribed from future private messages from __Dauntless Gaming Community__!");
					CoreUtil.aerLog(client,usr.username + " unsubscribed from automated DMs");
				}
				if(event.t === "MESSAGE_REACTION_REMOVE") {
					usr.subscribe();
					user.send("You've successfully resubscribed to private messages from __Dauntless Gaming Community__!");
					CoreUtil.aerLog(client,usr.username + " resubscribed to automated DMs");
				}
			});
		}
	}

	if(!channel || !user) {
		return;
	}

	const message = await channel.fetchMessage(data.message_id);
	
	if(message.guild) {
		var tmpMember = message.guild.members.get(user.id);
		var tmpGuild = message.guild;
	} else {
		var tmpMember = mainGuild.members.get(user.id);
		var tmpGuild = mainGuild;
	}

	if (event.t === "MESSAGE_REACTION_ADD" || event.t === "MESSAGE_REACTION_REMOVE") {
		PS.analyzeRawEvent(client, data, channel, message);
	}

	if (event.t === "MESSAGE_REACTION_ADD") {
		//console.log(message.reactions);
		/*if(data.emoji.id === HHS.getPrizeEmojiId()) {
			HHS.prizeFound(message, user.id, client);
		}*/
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
					var memberRole = eventGuild.roles.get("524900839651803157");
					var alreadyMember = member.roles.get("524900839651803157");
					var msgText = "";

					if (event.t === "MESSAGE_REACTION_ADD") {
						if(!alreadyMember) {
							var welcomeChannel = client.channels.get("667569600401244172");
							member.addRole(memberRole);
							/*client.channels.get("579383236334059521").send("Welcome " + member + " and thank you for adding yourself to a group and becoming a Member! " +
							"Please make sure you've read all of the " + welcomeChannel + " channel to get the most out of our community.");*/
							NMS.userBecomesMember(member, group, client);
						}
						if(!alreadyGroupMember) {
							member.addRole(role);
							group.incrementNumMembers();
							group.addMember(group.name,member.id);
							msgText = "Hey " + member.displayName + "! I just added you to the **" + group.name + "** group.";
							//channel.send("Added @" + member.displayName + " to group " + group.name);
							NMS.userJoinsGroup(member, group, client);
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
						NMS.userLeavesGroup(member, group, client);
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
				AS.setAchievementChannel(client.channels.get(doc.botChannelId));
				AS.setHandleActivity(HandleActivity);
				SS.setStoreChannel(client.channels.get("601981031511359518"));
				SS.setHandleActivity(HandleActivity);
				SS.setServer(server);
				SS.setClient(client);
				ACTS.setConsoleCodeChannel(client.channels.get("648636215368613908"));
				ACTS.setPCCodeChannel(client.channels.get("649351980338249739"));
				ACTS.setBotsChannel(client.channels.get("601981031511359518"));
				//HHS.initialize();
				//HHS.setBotsChannel(client.channels.get("601981031511359518"));
				//HHS.setPublicChannel(client.channels.get("579383236334059521"));
				MQS.setServer(server);
				MFS.setServer(server);
				NMS.setNonMemberChannel("633329366662643732");
				NMS.setPublicChannel("579383236334059521");
				NMS.setWelcomeReadmeChannel(doc.welcomeChannelId);
				BATTLE_SERVICE.setClient(client);
				BATTLE_SERVICE.setServer(server);
			}
		});

		if(server.id === "524900292836458497") {
			mainGuild = server;
		}
	});

	wait(500);

	// Load all invites for all guilds and save them to the cache.
	mainGuild.fetchInvites().then(guildInvites => {invites = guildInvites;});

	//doServerIteration();
	doNitroCheck();
	//doVoiceChannelScan();
});

client.on("voiceStateUpdate", member => {

});

client.on("guildMemberAdd", (member) => {
	if(!member.user.bot) {
		CoreUtil.dateLog("Sending welcome message to " + member.user.username);
		var aerMem = mainGuild.members.get("151473524974813184");
		//Need to make this a command or configuration
		/*member.send("**Welcome to the Dauntless Gaming Community!**\n\nAt that point we should start to grow quite quickly. "
		+ "If you have any questions, comments, or suggestions please feel free to message any of our staff.");*/
		//+ "\n\n > If you decide to leave: __Please__ message " + aerMem + " before you do and let us know you're unhappy here. Your feedback would be greatly appreciated and will help future members of Dauntless!"
		//+ "\n > If you're here to spam your own Discord server, stream, website, etc please just message " + aerMem + " and we can discuss a potential partnership or advertisement swap!");
		
		var newUserData = newUser(member.id, member.displayName);

		client.serverModel.findById(member.guild.id).exec().then(server => {
			var welcomeChannel = client.channels.get(server.welcomeChannelId);
			var rulesChannel = client.channels.get("632667753936977921");
			//var introChannel = client.channels.get(server.introChannelId);

			/*client.channels.get("633329366662643732").send("Welcome " + member + " to the Dauntless Gaming Community! In order to gain access to the rest of our community you must "
			+ "read the " + welcomeChannel + " channel and add yourself to some game and platforms groups.");*/
			NMS.userJoinsServer(member, client);

			member.addRole(server.welcomeRole);
			//CoreUtil.aerLog(client,member.user.username + " joined the server and was assigned the welcome role.");
		});

		member.guild.fetchInvites().then(guildInvites => {
			// This is the *existing* invites for the guild.
			const ei = invites;
			// Update the cached invites for the guild.
			invites = guildInvites;
			// Look through the invites, find the one for which the uses went up.
			const invite = guildInvites.find(i => {
				if(ei.has(i.code)) {
					return ei.get(i.code).uses < i.uses;
				} else {
					//console.log(i);
					return i.uses > 0;
				}
			});
			// This is just to simplify the message being sent below (inviter doesn't have a tag property)
			//console.log(guildInvites);
			if(invite) {
				console.log(invite.code + invite.inviter ? " " + invite.inviter.tag : "" + " " + invite.channel.name + invite.uses ? " " + invite.uses : "");
				const inviter = client.users.get(invite.inviter.id);
				// Get the log channel (change to your liking)
				//const logChannel = member.guild.channels.find(channel => channel.name === "invite-log");
				// A real basic message with the information we need. 
				
				if(inviter && (invite.channel.parentID === "628668360887894057" || invite.channel.parentID === "630030213924782080")) {
					//console.log("------[INVITER]-------");
					//console.log(inviter);
					CoreUtil.aerLog(client,`${member} joined! Invited by **${inviter.member ? inviter.member.displayName : inviter.tag}** from ${invite.channel} (Total: ${invite.uses}).`);
				} else if(inviter){
					CoreUtil.aerLog(client,`${member} joined! Invited by **${inviter.member ? inviter.member.displayName : inviter.tag}.**`);
				} else {
					CoreUtil.aerLog(client,`${member} joined!`);
				}

				console.log("------[INVITER]-------");
				console.log(inviter.id);
				if(inviter.id) {
					UserModel.findById(member.id).exec().then(userData => {
						userData.referrer = inviter.id;
						console.log(userData);
						userData.save();
					});
					//Tanny
					if(inviter.id === "570442148072390656") {
						member.addRole("708749097657565215");
					}
				}
			} else {
				CoreUtil.aerLog(client,`${member} joined!`);
			}
		});
	}
});

client.on("guildMemberRemove", (member) => {
	if(!member.user.bot) {
		CoreUtil.aerLog(client,member + " left the server. :(");
		NMS.userLeavesServer(member, client);
		UserModel.findById(member.user.id).exec().then(userData => {
			if(userData) {
				userData.left = new Date();
				userData.save();
			}
		});
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
					//CoreUtil.dateLog(`Updating ${member.displayName} - ${member.presence.status}`);
					UserModel.findById(member.id).exec().then(userData => { 
						if(userData) {
							//console.log(new DateDiff(new Date(), new Date(userData.joined)).days());

							if(member.presence.game && member.presence.game.name && member.presence.game.applicationID) {
								userData.addLatestGame(member.presence.game.name);

								/*var council = member.roles.get("524900839651803157");
								var nitro = member.roles.get("524900839651803157");
								var contentCreator = member.roles.get("524900839651803157");*/

								//if(member.id === "151473524974813184") {
									Group.findGroupByAppId(member.presence.game.applicationID).then(async group => {
										if(group) {
											//console.log(group);
											var role = server.roles.find(role => role.name.toLowerCase().trim() === group.name.toLowerCase().trim());
											var alreadyGroupMember = (member.roles.find(role => role.name.toLowerCase().trim() === group.name.toLowerCase().trim()));
											var memberRole = server.roles.get("524900839651803157");
											var alreadyMember = member.roles.get("524900839651803157");
						
											var channel = server.channels.get(group.channelId);
						
											/*if(!alreadyMember) {
												member.addRole(memberRole);
											}*/
						
											if(!alreadyGroupMember && alreadyMember) {
												console.log("---");
												console.log(group.name);
												console.log(member.presence.game);
												console.log("---");
												member.addRole(role);
												group.incrementNumMembers();
												group.addMember(group.name,member.id);
												
												if(group.public) {
													console.log(member.displayName + " is not yet in " + group.name + " group! Adding them.");
													CoreUtil.aerLog(client,member.displayName + " automatically added to " + group.name);
													member.send("Hey " + member.displayName + "! We noticed you playing " + group.name + " and automatically added you to that group. You now have access to the " + channel + " channel in __Dauntless Gaming Community__! You should head over to " + channel + " and see if anyone wants to play!");
												} else {
													console.log(member.displayName + " is not yet in " + group.name + " group! Secretly adding them.");
													CoreUtil.aerLog(client,member.displayName + " secretly added to " + group.name);
													//member.send("Hey " + member.displayName + "! We noticed you playing " + group.name + " and automatically added you to that group. You now have access to the " + channel + " channel in __Dauntless Gaming Community__!");
												}
											} else {
												console.log(member.displayName + " is already in " + group.name + " group or not a member!");
											}
										}
									});
								//}
							}
							
							if(new DateDiff(new Date(), new Date(userData.joined)).days() >= 14) {
								//console.log(member.displayName + " joined over 14 days ago!");
								if(member.roles.find(role => role.id === serverData.welcomeRole)) {
									console.log(member.displayName + " is still in the welcome role! Removing Welcome Role & Adding Member Role.");
									member.removeRole(serverData.welcomeRole);
									//member.addRole(serverData.memberRoleId);
								}
							}
							HandleActivity(client,server,{},userData);
						} else {
							newUser(member.id, member.displayName).save();
						}
					});
					await CoreUtil.waitFor(500);
				}
			});
		});
	})
}

//message.guild

async function doNitroCheck() {
	CoreUtil.dateLog(`[Nitro Interval]`);

	var now = new Date();
	console.log(now.getHours());
	if(now.getHours() === 20){
        Aerbot.get("last_nitro_bonus_date").then(async meta => {
			
			if(meta) {
				//console.log(meta);
				var lastNitroBonusDate = new Date(meta.value);

				var memberStr = "";

				console.log(lastNitroBonusDate.getDate() + " vs " + now.getDate());
				if(lastNitroBonusDate.getDate() != now.getDate()) {
					CoreUtil.dateLog(`[DOING Nitro Interval]`);

					var nitroBoosters = await mainGuild.roles.get('586736809166241803').members;
					Aerbot.set("last_nitro_bonus_date", now);
					nitroBoosters.forEach(member => {
						console.log(member.displayName);
						UserModel.findById(member.id).exec().then(userData => { 
							if(userData) {
								HandleActivity(client,mainGuild,{booster: true},userData);
							}
						});
					});

					var newExp = MemberUtil.calculateActionExp("booster");
    				var newCurrency = MemberUtil.calculateActionCurrency("booster");

					const embed = new Discord.RichEmbed();
					embed.setColor("#F47FFF");
					embed.setTitle(`Daily Nitro Booster Appreciation Bonus`);
					embed.setDescription("Every Nitro Booster has been awarded a daily bonus of **" + newCurrency + " Currency** and **" + newExp + " EXP**! Thank you so much to all of our Nitro Boosters:\n\n" + nitroBoosters.array().join(", "));

					client.channels.get("579383236334059521").send(DiscordUtil.processEmbed(embed, client));
				}
			}
		});
    }
}

async function doVoiceChannelScan() {
	CoreUtil.dateLog(`[Voice Interval]`);
	const channels = client.guilds.get("524900292836458497").channels.filter(c => c.type === 'voice' && c.name.toLowerCase() != "afk");

	for (const [channelID, channel] of channels) {
		console.log("[" + channel.members.size + "] Channel " + channelID + " : " + channel.name);
		for (const [memberID, member] of channel.members) {
			console.log("Member " + memberID + " : " + member.user.username);
			if(channel.members.size > 1) {
				console.log("Giving voice credit to " + member.user.username);
				UserModel.findById(memberID).exec().then(userData => {
					if(userData) {
						HandleActivity(client,client.guilds.get("524900292836458497"),{voice: true},userData);
					}
				});
			}
		}
	}
}



async function doSendMessages() {
	CoreUtil.dateLog(`[Send Message Interval]`);

	MQS.sendNextMessage();
}

function checkOnlineStatus(server) {
	//Need to move stuff from doServerIteration into here
}

function newUser(uid, name) {
    CoreUtil.dateLog(`Creating ${uid} - ${name}`);
    return UserModel.create({ _id: uid, username: name });
}