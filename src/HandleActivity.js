const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");
const mongoose = require('mongoose');
const DailyActivity = mongoose.model('DailyActivity');
const Activity = mongoose.model('Activity');
const AchievementService = require("./services/AchievementService");
const Achievement = mongoose.model('Achievement');

const AS = new AchievementService();

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
		var startLvl = userData.level;

		var originalExp = userData.exp;

		//give activity points
		userData.activityPoints++;
		exp = MemberUtil.calculateNewExp("activity", exp);

		//Handle Message
		if(activity.message) {
			userData.messages++;

			var newExp = MemberUtil.calculateActionExp("message");
			exp += newExp; 

			DailyActivity.add(userData.id, "message", newExp);
			Activity.add(userData.id, "message", newExp);

			//Fix username
			if(activity.message.member.displayName) {
				userData.username = activity.message.member.displayName;
			}
		}

		//Handle Reaction
		if(activity.reaction) {
			userData.reactions++;

			var newExp = MemberUtil.calculateActionExp("reaction");
			exp += newExp; 

			DailyActivity.add(userData.id, "reaction", newExp);
			Activity.add(userData.id, "reaction", newExp);
		}

		//Handle Event
		if(activity.event) {
			userData.events++;

			var achievement = await Achievement.findByName("eventer");

			if(!userData.achievements.includes(achievement.id)) {
				await AS.addAchievementFromActivity(userData, achievement, client, server);
				activity.achievement = achievement.expBonus;
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("event");
			exp += newExp; 

			DailyActivity.add(userData.id, "event", newExp);
			Activity.add(userData.id, "event", newExp);
		}

		//Handle Pinned
		if(activity.pinned) {
			userData.pinned++;

			var achievement = await Achievement.findByName("pinned");

			if(!userData.achievements.includes(achievement.id)) {
				await AS.addAchievementFromActivity(userData, achievement, client, server);
				activity.achievement = achievement.expBonus;
			}

			console.log(activity);

			var newExp = MemberUtil.calculateActionExp("pinned");
			exp += newExp; 

			DailyActivity.add(userData.id, "pinned", newExp);
			Activity.add(userData.id, "pinned", newExp);
		}

		//Handle Trivia Question
		if(activity.trivia) {
			if(activity.trivia === "question") {
				userData.triviaCorrect++;

				var newExp = MemberUtil.calculateActionExp("trivia_question");
				exp += newExp; 
			} else if(activity.trivia === "game") {
				userData.triviaWon++;

				var newExp = MemberUtil.calculateActionExp("trivia_game");
				exp += newExp; 
			}

			DailyActivity.add(userData.id, "trivia", newExp);
			Activity.add(userData.id, "trivia", newExp);
		}

		//Handle Voice
		if(activity.voice) {
			userData.voiceActivity++;

			var newExp = MemberUtil.calculateActionExp("voice");
			exp += newExp; 

			DailyActivity.add(userData.id, "voice", newExp);
			Activity.add(userData.id, "voice", newExp);
		}

		//Handle Achievement
		console.log("Checking activity.achievement");
		if(activity.hasOwnProperty('achievement')) {
			console.log("activity.achievement = " + activity.achievement);
			//userData.achievements++;
			
			if(!isNaN(activity.achievement)) {
				var newExp = (MemberUtil.calculateActionExp("achievement") + activity.achievement);
			} else {
				var newExp = MemberUtil.calculateActionExp("achievement");
			}

			console.log("USER GETS " + newExp + " ACHIEVEMENT EXP!");

			exp += newExp
			
			DailyActivity.add(userData.id, "achievement", newExp);
			Activity.add(userData.id, "achievement", newExp);
		}

		console.log(userData.id);
		var member = server.members.get(userData.id);
		//console.log(member);

		var expectedExp = userData.messages + userData.activityPoints + (userData.reactions*4) + (userData.events*50) + (userData.voiceActivity * 4);
		userData.exp = exp;
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

		if(saveDoc){
			userData.save();
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

		console.log(userData.username + "(" + userData.level + ")[" + startLvl + "] exp: " + exp + " | originalExp: " + originalExp);
	}
}

module.exports = handleActivityNew;