/**
 * Member utilities. Only deals with member exp right now.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
const CoreUtil = require("./Util.js");

function calculateNewExp(action, currentExp) {
	CoreUtil.dateLog(`Adding ${calculateActionExp(action)} exp`);
	return currentExp + calculateActionExp(action);
}

function calculateActionExp(action) {
	switch(action) {
		case 'lottery':
			return 100;
			break;
		case 'reaction':
			return 4;
			break;
		case 'praise':
			return 10;
			break;
		case 'event':
			return 50;
			break;
		case 'br_win':
			return 100;
			break;
		case 'message':
			return 1;
			break;
		default:
			return 1;
	}
}

function calculateLevel(exp) {
	/*CoreUtil.dateLog(`New Level: ${Math.round(0.1 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`New Level: ${Math.round(0.2 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`New Level: ${Math.round(0.25 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`New Level: ${Math.round(0.3 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`New Level: ${Math.round(0.5 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);*/
	return Math.max(1,Math.round(0.25 * Math.sqrt(exp)));
}

function handleLevelRoles(user, member, server, serverData) {
	var usrLvl = user.level;
	var highestLevel = 0;

	serverData.levelRoles.forEach(function(value, key) {
		if(key > highestLevel && key <= usrLvl) {
			highestLevel = parseInt(key);
		}
	});

	//console.log("Highest Level: " + highestLevel);

	if(highestLevel > 0) {
		var roleId = serverData.levelRoles.get(highestLevel.toString());
		var alreadyGroupMember = (member.roles.get(roleId));

		if(!user.levelRole) {
			user.levelRole = "0";
		}

		if(!alreadyGroupMember) {
			if(user.levelRole != roleId) {
				console.log(user.username + " removing role");
				if(server.roles.get(user.levelRole)) {
					member.removeRole(server.roles.get(user.levelRole));
				}
			}
			user.levelRole = roleId;
			//user.save();
			member.addRole(server.roles.get(roleId));
			console.log(user.username + " adding role");
		} else {
			console.log(user.username + " has the proper role set.");
		}
	}
}

module.exports = {
	calculateNewExp,
	calculateActionExp,
	calculateLevel,
	handleLevelRoles
};