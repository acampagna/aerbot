const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");

/**
 * Main function to handle user activity. Mostly just deals with adding exp based on user actions.
 * UNFINISHED. HAS A FEW BAD BUGS. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

async function handleActivityNew(client, server, activity, userData) {
	if(userData && userData.id) {
		let date = new Date();

		userData.lastOnline = date;
		userData.lastActive = date;

		var exp = userData.exp;
		var startLvl = userData.level;

		var originalExp = userData.exp;
		var expectedExp = userData.messages + userData.activityPoints + (userData.reactions*4);

		//give activity points
		userData.activityPoints++;
		exp = MemberUtil.calculateNewExp("activity", exp);

		//Handle Message
		if(activity.message) {
			userData.lastMessage = date;
			userData.messages++;
			exp = MemberUtil.calculateNewExp("message", exp);

			//Fix username
			if(activity.message.member.displayName) {
				userData.username = activity.message.member.displayName;
			}
		}

		//Handle Reaction
		if(activity.reaction) {
			userData.lastReaction = date;
			userData.reactions++;
			exp = MemberUtil.calculateNewExp("reaction", exp);
			//console.log(server);
		}

		//Handle Event
		if(activity.event) {
			userData.events++;
			exp = MemberUtil.calculateNewExp("event", exp);
		}

		console.log(userData.id);
		var member = server.members.get(userData.id);
		//console.log(member);

		userData.exp = exp;
		userData.level = MemberUtil.calculateLevel(exp);

		//TODO: Fix this being a promise on newUser
		if(exp >= originalExp && exp >= expectedExp) {

			if(userData.level != startLvl) {
				await client.serverModel.findById(server.id).exec().then(serverData => {
					if(serverData.botChannelId) {
						client.channels.get(serverData.botChannelId).send(member.displayName + " has leveled up to level " + userData.level + "!");
						MemberUtil.handleLevelRoles(userData, member, server, serverData);
					}
				});
			}

			userData.save();
		} else {
			var errStr = "*exp: " + exp + " | originalExp: " + originalExp + " | expectedExp: " + expectedExp + "*";
			CoreUtil.aerLog(client,userData.username + "'s experience points are corrupted! Attempting to fix...");
			if(originalExp > expectedExp) {
				CoreUtil.aerLog(client,userData.username + "'s experience points almost got corrupted, aborting save. Check Logs!\n" + errStr);
				CoreUtil.dateLog(activity);
			} else {
				CoreUtil.aerLog(client,userData.username + "'s experience points are corrupted. Fixing their exp right now!\n" + errStr);
				userData.exp = expectedExp;
				userData.save();
			}
		}

		console.log(userData.username + "(" + userData.level + ")[" + startLvl + "] exp: " + exp + " | originalExp: " + originalExp + " | expectedExp: " + expectedExp);
	}
}

module.exports = handleActivityNew;