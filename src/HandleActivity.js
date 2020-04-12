const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');
const AchievementService = require("./services/AchievementService");
const NewMemberService = require("./services/NewMemberService");
const Achievement = mongoose.model('Achievement');

const AS = new AchievementService();
const NMS = new NewMemberService();

/**
 * Main function to handle user activity. Mostly just deals with adding exp based on user actions.
 * UNFINISHED. HAS A FEW BAD BUGS. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

async function handleActivityNew(client, server, activity, userData) {
	if(userData && userData.id) {
		let date = new Date();
		var saveDoc = true;
		var achievementExp = 0;

		/*if(activity.achievement && !isNaN(activity.achievement)) {
			achievementExp = activity.achievement;
		}*/

		userData.lastOnline = date;
		if(activity.message || activity.reaction || activity.event || activity.voice){
			userData.lastActive = date;
		}

		var exp = userData.exp;
		var currency = userData.currency;
		var startLvl = userData.level;

		var originalExp = userData.exp;
		var originalCurrency = userData.currency;

		//Handle Message
		if(activity.message) {
			userData.messages++;
			userData.setCount("messages", userData.messages);

			//Put this inside the conditional...
			var achievement = await Achievement.findByName("loquacious");
			if(userData.messages >= 100) {
				var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.messages);
				if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
					console.log("[[Set activity.achievement to msgRet]]");
					console.log(msgRet);
					activity.achievement = msgRet;
				}
			}

			var newExp = MemberUtil.calculateActionExp("message");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("message");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "message", newExp);
			Activity.add(userData.id, "message", newExp);

			//Fix username
			if(activity.message.member.displayName) {
				userData.username = activity.message.member.displayName;
			}

			if(activity.message.channel.parentID === "646174743749459968") {
				userData.incCount("trendy_message");

				var achievement = await Achievement.findByName("trendy");
				if(userData.getCount("trendy_message") >= 10) {
					var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.getCount("trendy_message"));
					if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
						console.log("[[Set activity.achievement to msgRet]]");
						console.log(msgRet);
						if(activity.hasOwnProperty('achievement')) {
							activity.achievement.exp += msgRet.achievement.exp;
							activity.achievement.currency += msgRet.achievement.currency;
						} else {
							activity.achievement = msgRet;
						}
					}
				}

				var trendyExp = MemberUtil.calculateActionExp("trendy_message");
				exp += trendyExp;
				currency += MemberUtil.calculateActionCurrency("trendy_message");
				Activity.add(userData.id, "trendy_message", trendyExp);
			}

			if(activity.message.channel.id === "642979603652018179" && activity.message.attachments.size > 0 && activity.message.content.length > 10) {
				userData.incCount("gamesie_post");

				var achievement = await Achievement.findByName("Gamesiegenic");
				if(userData.getCount("gamesie_post") >= 10 && !userData.getBadges().has(achievement.id)) {
					await AS.addAchievementFromActivity(userData, achievement, client, server);

					if(activity.hasOwnProperty('achievement')) {
						activity.achievement.exp += MemberUtil.calculateActionExp("achievement") + achievement.expBonus;
						activity.achievement.currency += MemberUtil.calculateActionCurrency("achievement") + achievement.currencyBonus;
					} else {
						activity.achievement = {
							exp: (MemberUtil.calculateActionExp("achievement") + achievement.expBonus), 
							currency: (MemberUtil.calculateActionCurrency("achievement") + achievement.currencyBonus)
						};
					}
				}

				var gamesieExp = MemberUtil.calculateActionExp("gamesie_post");
				exp += gamesieExp
				currency += MemberUtil.calculateActionCurrency("gamesie_post");
				Activity.add(userData.id, "gamesie_post", gamesieExp);
			}

			if(activity.message.cleanContent.toLowerCase().includes("welcome")) {
				if(activity.message.channel.id === "579383236334059521" && NMS.newMemberExists() && !NMS.userHasWelcomedRecently(userData.id)) {
					userData.incCount("greet");
					NMS.setWelcomer(userData.id);
					console.log(userData.username + " welcomed a new member!");

					var achievement = await Achievement.findByName("Greeter");
					var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.getCount("greet"));
					if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
						console.log("[[Set activity.achievement to msgRet]]");
						console.log(msgRet);
						if(activity.hasOwnProperty('achievement')) {
							activity.achievement.exp += msgRet.achievement.exp;
							activity.achievement.currency += msgRet.achievement.currency;
						} else {
							activity.achievement = msgRet;
						}
					}
					
					var greetExp = MemberUtil.calculateActionExp("greet");
					exp += greetExp;
					currency += MemberUtil.calculateActionCurrency("greet");
					Activity.add(userData.id, "greet", greetExp);
				}
			}
		}

		//Handle Reaction
		if(activity.reaction) {
			userData.reactions++;
			userData.setCount("reactions", userData.reactions);

			var newExp = MemberUtil.calculateActionExp("reaction");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("reaction");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "reaction", newExp);
			Activity.add(userData.id, "reaction", newExp);
		}

		//Handle Event
		if(activity.event) {
			userData.events++;
			userData.setCount("events", userData.events);

			var achievement = await Achievement.findByName("eventer");

			var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.events);
			if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
				console.log("[[Set activity.achievement to msgRet]]");
				console.log(msgRet);
				activity.achievement = msgRet;
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("event");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("event");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "event", newExp);
			Activity.add(userData.id, "event", newExp);
		}

		//Handle Stream Engagement
		if(activity.stream_engagement) {
			userData.incCount("stream_engagement");

			/*var achievement = await Achievement.findByName("eventer");

			var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.events);
			if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
				console.log("[[Set activity.achievement to msgRet]]");
				console.log(msgRet);
				activity.achievement = msgRet;
			}*/

			console.log("---\n" + activity);

			var newExp = MemberUtil.calculateActionExp("stream_engagement");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("stream_engagement");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "stream", newExp);
			Activity.add(userData.id, "stream", newExp);
		}

		//Handle Stream Contributions
		if(activity.stream_contribution) {
			userData.incCount("stream_contribution");

			/*var achievement = await Achievement.findByName("eventer");

			var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.events);
			if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
				console.log("[[Set activity.achievement to msgRet]]");
				console.log(msgRet);
				activity.achievement = msgRet;
			}*/

			console.log("---\n" + activity);

			var newExp = MemberUtil.calculateActionExp("stream_contribution");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("stream_contribution");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "stream", newExp);
			Activity.add(userData.id, "stream", newExp);
		}

		//Handle Stream MVP
		if(activity.stream_mvp) {
			userData.incCount("stream_mvp");

			/*var achievement = await Achievement.findByName("eventer");

			var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.events);
			if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
				console.log("[[Set activity.achievement to msgRet]]");
				console.log(msgRet);
				activity.achievement = msgRet;
			}*/

			console.log("---\n" + activity);

			var newExp = MemberUtil.calculateActionExp("stream_mvp");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("stream_mvp");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "stream", newExp);
			Activity.add(userData.id, "stream", newExp);
		}

		//Handle Pinned
		if(activity.pinned) {
			userData.pinned++;
			userData.setCount("pinned", userData.pinned);

			var achievement = await Achievement.findByName("pinned");

			if(!userData.getBadges().has(achievement.id)) {
				await AS.addAchievementFromActivity(userData, achievement, client, server);

				activity.achievement = {
					exp: (MemberUtil.calculateActionExp("achievement") + achievement.expBonus), 
					currency: (MemberUtil.calculateActionCurrency("achievement") + (achievement.expBonus/20))
				};
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("pinned");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("pinned");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "pinned", newExp);
			Activity.add(userData.id, "pinned", newExp);
		}

		//Handle QOTD
		if(activity.qotd) {
			userData.incCount("qotd");

			var achievement = await Achievement.findByName("teachers pet");
			if(userData.getCount("qotd") >= 7) {
				var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.getCount("qotd"));
				if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
					console.log("[[Set activity.achievement to msgRet]]");
					console.log(msgRet);
					activity.achievement = msgRet;
				}
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("qotd");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("qotd");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "qotd", newExp);
			Activity.add(userData.id, "qotd", newExp);
		}

		//Handle Trivia Question
		if(activity.trivia) {
			if(activity.trivia === "question") {
				userData.triviaCorrect++;
				userData.setCount("triviaCorrect", userData.triviaCorrect);

				var achievement = await Achievement.findByName("smarty pants");
				if(userData.triviaCorrect >= 10) {
					var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.triviaCorrect);
					if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
						console.log("[[Set activity.achievement to msgRet]]");
						activity.achievement = msgRet;
					}
				}

				var newExp = MemberUtil.calculateActionExp("trivia_question");
				exp += newExp; 

				var newCurrency = MemberUtil.calculateActionCurrency("trivia_question");
				currency += newCurrency;

			} else if(activity.trivia === "game") {
				userData.triviaWon++;
				userData.setCount("triviaWon", userData.triviaWon);

				var achievement = await Achievement.findByName("nerd alert");

				if(!userData.getBadges().has(achievement.id)) {
					await AS.addAchievementFromActivity(userData, achievement, client, server);

					activity.achievement = {
						exp: (MemberUtil.calculateActionExp("achievement") + achievement.expBonus), 
						currency: (MemberUtil.calculateActionCurrency("achievement") + (achievement.expBonus/20))
					};
				}

				var newExp = MemberUtil.calculateActionExp("trivia_game");
				exp += newExp; 

				var newCurrency = MemberUtil.calculateActionCurrency("trivia_game");
				currency += newCurrency;
			}

			//DailyActivity.add(userData.id, "trivia", newExp);
			Activity.add(userData.id, "trivia", newExp);
		}

		//Handle Voice
		if(activity.voice) {
			userData.voiceActivity++;
			userData.setCount("voiceActivity", userData.voiceActivity);

			var voiceHours = userData.getCount("voiceActivity") / 6;

			var achievement = await Achievement.findByName("chatterbox");
			if(voiceHours >= 4) {
				var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, voiceHours);
				if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
					console.log("[[Set activity.achievement to msgRet]]");
					console.log(msgRet);
					activity.achievement = msgRet;
				}
			}

			var newExp = MemberUtil.calculateActionExp("voice");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("voice");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "voice", newExp);
			Activity.add(userData.id, "voice", newExp);
		}

		//Handle Shop Purchase
		/*if(activity.qotd) {
			userData.incCount("purchase");

			var achievement = await Achievement.findByName("teachers pet");
			if(userData.getCount("qotd") >= 7) {
				var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.getCount("qotd"));
				if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
					console.log("[[Set activity.achievement to msgRet]]");
					console.log(msgRet);
					activity.achievement = msgRet;
				}
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("qotd");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("qotd");
			currency += newCurrency;

			//DailyActivity.add(userData.id, "qotd", newExp);
			Activity.add(userData.id, "qotd", newExp);
		}*/

		//Handle Moneybags
		if(activity.moneybags) {
			userData.incCount("moneybags");

			var achievement = await Achievement.findByName("moneybags");
			var msgRet = await AS.processRankedAchievementActivity(userData, achievement, client, server, userData.getCount("moneybags"));
			if(msgRet.exp && !isNaN(msgRet.exp) && msgRet.exp > 0) {
				console.log("[[Set activity.achievement to msgRet]]");
				console.log(msgRet);
				activity.achievement = msgRet;
			}
		}

		//Handle holiday_hunter
		if(activity.holiday_hunter) {
			userData.incCount("holiday_hunter");

			var achievement = await Achievement.findByName("egg hunter");

			if(!userData.getBadges().has(achievement.id)) {
				await AS.addAchievementFromActivity(userData, achievement, client, server);

				activity.achievement = {
					exp: (MemberUtil.calculateActionExp("achievement") + achievement.expBonus), 
					currency: (MemberUtil.calculateActionCurrency("achievement") + (achievement.expBonus/20))
				};
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("holiday_hunter");
			exp += newExp; 

			var newCurrency = MemberUtil.calculateActionCurrency("holiday_hunter");
			currency += newCurrency;

			Activity.add(userData.id, "holiday_hunter", newExp);
		}

		//Handle Achievement
		//console.log("Checking activity.achievement");
		if(activity.hasOwnProperty('achievement')) {
			userData.setCount("achievements", userData.getBadges().size);
			console.log("activity.achievement = " + activity.achievement);
			//userData.achievements++;

			console.log(activity.achievement);

			exp += activity.achievement.exp;
			currency += activity.achievement.currency;
			
			//DailyActivity.add(userData.id, "achievement", activity.achievement.exp);
			Activity.add(userData.id, "achievement", activity.achievement.exp);
		}

		//give activity points
		userData.activityPoints++;
		/*if(exp === originalExp) {
			var newExp = MemberUtil.calculateNewExp("activity");
			exp += newExp;
		}*/

		//console.log(userData.id);
		var member = server.members.get(userData.id);
		//console.log(member);

		var expectedExp = userData.messages + userData.activityPoints + (userData.reactions*4) + (userData.events*50) + (userData.voiceActivity * 4);
		userData.exp = exp;
		userData.currency = Math.round(currency);
		userData.level = MemberUtil.calculateLevel(exp);

		//TODO: Fix this being a promise on newUser
		//if(exp >= originalExp && exp >= expectedExp && exp < (expectedExp*1.5)) {
		if(userData.level != startLvl) {
			await client.serverModel.findById(server.id).exec().then(serverData => {
				if(serverData.botChannelId) {
					client.channels.get(serverData.botChannelId).send(member.displayName + " has leveled up to level " + userData.level + "!");
					MemberUtil.handleLevelRoles(userData, member, server, serverData);
				}
			});
		}

		if(userData.exp > originalExp) {
			userData.exp++;
			console.log(userData.username + "(" + userData.level + ")[" + startLvl + "] exp: " + exp + " | originalExp: " + originalExp + " | $: " + currency + " | orig$: " + originalCurrency);
		}

		if(userData.exp >= originalExp){
			//console.log("Exp >= OriginalExp. Saving.");
			userData.save();
		} else {
			console.error("OriginalExp > Exp. Not Saving!");
		}
		
		/*} else {
			var errStr = "*exp: " + exp + " | originalExp: " + originalExp + " | expectedExp: " + expectedExp + "*";
			//CoreUtil.aerLog(client,userData.username + "'s experience points are corrupted! Attempting to fix...");
			if(originalExp > exp) {
				CoreUtil.aerLog(client,userData.username + "'s experience points almost got corrupted, aborting save. Check Logs!\n" + errStr);
				CoreUtil.dateLog(activity);
			} else {
				CoreUtil.aerLog(client,userData.username + "'s experience points are being adjusted based on new exp values!\n" + errStr);
				userData.exp = expectedExp;
				userData.save();
			}
		}*/
	}
}

module.exports = handleActivityNew;