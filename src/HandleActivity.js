const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");

/**
 * Main function to handle user activity. Mostly just deals with adding exp based on user actions.
 * UNFINISHED. HAS A FEW BAD BUGS. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function handleActivity(client, id, message, reaction, userData) {
    if (userData) {
		let date = new Date();

		newUserData = {
			lastOnline: date,
			lastActive: date
		};

		//handle exp
		var exp = userData.exp;

		//give activity points
		userData.activityPoints++;
		exp = MemberUtil.calculateNewExp("activity", exp);

		if(message) {
			newUserData.last_message = date;
			userData.messages++;
			exp = MemberUtil.calculateNewExp("message", exp);

			//Fix username
			if(message.member.displayName) {
				if(message.member.displayName !== userData.username) {
					newUserData.username = message.member.displayName;
				}
			}
		}

		if(reaction) {
			newUserData.lastReaction = date;
			userData.reactions++;
			exp = MemberUtil.calculateNewExp("reaction", exp);
		}

		newUserData.exp = exp;
		newUserData.level = calculateLevel(exp);

		//CoreUtil.dateLog(`Registering Activity ${id} - ${newUserData}`);

		Object.assign(userData, newUserData);

		//TODO: Fix this being a promise on newUser
		userData.save();
	}
}

function calculateLevel(exp) {
	//CoreUtil.dateLog(`New Level: ${Math.round(0.25 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	return Math.max(1,Math.round(0.25 * Math.sqrt(exp)));
}

module.exports = handleActivity;