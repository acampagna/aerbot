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
			return 50;
			break;
		case 'reaction':
			return 2;
			break;
		case 'event':
			return 50;
			break;
		case 'br_win':
			return 50;
			break;
		case 'message':
			return 1;
			break;
		case 'voice':
			return 4;
			break;
		case 'trivia_question':
			return 10;
			break;
		case 'trivia_game':
			return 50;
			break;
		case 'pinned':
			return 10;
			break;
		case 'achievement':
			return 50;
			break;
		default:
			return 1;
			break;
	}
}

function calculateLevel(exp) {
	/*CoreUtil.dateLog(`0.1 New Level: ${Math.round(0.1 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`0.2 New Level: ${Math.round(0.2 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`0.25 (current) New Level: ${Math.round(0.25 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`0.3 New Level: ${Math.round(0.3 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	CoreUtil.dateLog(`0.5 New Level: ${Math.round(0.5 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);*/
	return Math.max(1,Math.floor(0.3 * Math.sqrt(exp)));
}

function calculateNextLevelExp(lvl, exp) {
	//CoreUtil.dateLog(`EXP to next level: ${((Math.ceil(Math.pow((lvl+1) / 0.3, 2))) - exp)} | Lvl: ${(lvl+1)} | Pow(${((lvl+1) / 0.3)}): ${Math.pow(((lvl+1) / 0.3), 2)}`);

	return ((Math.ceil(Math.pow((lvl+1) / 0.3, 2))) - exp);
}

function handleLevelRoles(user, member, server, serverData) {
	var usrLvl = user.level;
	var highestLevel = 0;

	serverData.levelRoles.forEach(function(value, key) {
		if(key > highestLevel && key <= usrLvl) {
			highestLevel = parseInt(key);
		}
	});

	console.log(user);
	console.log(user.username + " leveled up!");
	console.log("usrLvl: " + usrLvl + " | Highest Level: " + highestLevel);

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

function validURL(str) {
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
	  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return !!pattern.test(str);
}

function domainNameMatches(hostname, domainName) {
	console.log(hostname.split(".").filter(h => h === domainName));
	return (hostname.split(".").filter(h => h === domainName).length > 0)
}

module.exports = {
	calculateNewExp,
	calculateActionExp,
	calculateLevel,
	handleLevelRoles,
	calculateNextLevelExp,
	validURL,
	domainNameMatches
};