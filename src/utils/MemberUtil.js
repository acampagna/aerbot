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
	var exp = 1;
	switch(action) {
		case 'lottery':
			exp = 50;
			break;
		case 'reaction':
			exp = 4;
			break;
		case 'event':
			exp = 100;
			break;
		case 'br_win':
			exp = 100;
			break;
		case 'message':
			exp = 1;
			break;
		case 'trendy_message':
			exp = 1;
			break;
		case 'gamesie_post':
			exp = 10;
			break;
		case 'voice':
			exp = 4;
			break;
		case 'trivia_question':
			exp = 5;
			break;
		case 'trivia_game':
			exp = 50;
			break;
		case 'qotd':
			exp = 25;
			break;
		case 'pinned':
			exp = 50;
			break;
		case 'achievement':
			exp = 100;
			break;
		case 'stream_engagement':
			exp = 10;
			break;
		case 'stream_contribution':
			exp = 25;
			break;
		case 'stream_mvp':
			exp = 50;
			break;
		case 'recruit':
			exp = 500;
			break;
		case 'greet':
			exp = 20;
			break;
		case 'holiday_hunter':
			exp = 10;
			break;
		case 'booster':
			exp = 25;
			break;
		case 'battle_win':
			exp = 2;
			break;
		case 'battle_lose':
			exp = 1;
			break;
	}

	return exp;
}

function calculateActionCurrency(action) {
	var currency = 0;
	switch(action) {
		case 'lottery':
			currency = 5;
			break;
		case 'reaction':
			currency = 0;
			break;
		case 'event':
			currency = 5;
			break;
		case 'br_win':
			currency = 1;
			break;
		case 'message':
			currency = 0;
			break;
		case 'voice':
			currency = 0;
			break;
		case 'trivia_question':
			currency = 0;
			break;
		case 'trivia_game':
			currency = 5;
			break;
		case 'qotd':
			currency = 2;
			break;
		case 'pinned':
			currency = 2;
			break;
		case 'achievement':
			currency = 10;
			break;
		case 'stream_engagement':
			currency = 0;
			break;
		case 'stream_contribution':
			currency = 2;
			break;
		case 'stream_mvp':
			currency = 5;
			break;
		case 'recruit':
			currency = 10;
			break;
		case 'greet':
			currency = 0;
			break;
		case 'holiday_hunter':
			currency = 1;
			break;
		case 'booster':
			currency = 5;
			break;
		case 'battle_win':
			currency = 0;
			break;
		case 'battle_lose':
			currency = 0;
			break;
	}

	return currency;
}

function calculateLevel(exp) {
	if(exp > 10) {
		var lvl = Math.max(1,Math.floor(0.95 * Math.pow(exp, 1/2.6)));
		console.log("---[" + Math.round(0.3 * Math.sqrt(exp)) + "]--");
		//console.log(`0.3 (current) New Level: ${Math.round(0.3 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
		//console.log(`0.32: ${Math.round(0.32 * Math.sqrt(exp))}`);
		//console.log(`0.8 2.4: ${Math.max(1,Math.floor(0.8 * Math.pow(exp, 1/2.4)))}`);
		//console.log(`0.7 2.4: ${Math.max(1,Math.floor(0.7 * Math.pow(exp, 1/2.4)))}`);
		//console.log(`0.75 2.4: ${Math.max(1,Math.floor(0.75 * Math.pow(exp, 1/2.4)))}`);
		//console.log(`0.8 2.45: ${Math.max(1,Math.floor(0.8 * Math.pow(exp, 1/2.45)))}`);
		//console.log(`0.85 2.5: ${Math.max(1,Math.floor(0.85 * Math.pow(exp, 1/2.5)))}`);
		//console.log(`0.85 2.55: ${Math.max(1,Math.floor(0.85 * Math.pow(exp, 1/2.55)))}`);
		//console.log(`0.875 2.525: ${Math.max(1,Math.floor(0.875 * Math.pow(exp, 1/2.525)))}`);
		//console.log(`0.85 2.65: ${Math.max(1,Math.floor(0.85 * Math.pow(exp, 1/2.65)))}`);
		//console.log(`0.9 2.5: ${Math.max(1,Math.floor(0.9 * Math.pow(exp, 1/2.5)))}`);
		//console.log(`0.9 2.525: ${Math.max(1,Math.floor(0.9 * Math.pow(exp, 1/2.525)))}`);
		//console.log(`0.9 2.55: ${Math.max(1,Math.floor(0.9 * Math.pow(exp, 1/2.55)))}`);
		console.log(`0.925 2.55: ${Math.max(1,Math.floor(0.925 * Math.pow(exp, 1/2.55)))} | EXP to lvl: ${(Math.ceil(Math.pow((lvl+1) / 0.925, 2.55)) - exp)}`);
		//console.log(`0.95 2.55: ${Math.max(1,Math.floor(0.95 * Math.pow(exp, 1/2.55)))}`);
		//console.log(`0.95 2.575: ${Math.max(1,Math.floor(0.95 * Math.pow(exp, 1/2.575)))}`);
		//console.log(`[0.95 2.6]: ${Math.max(1,Math.floor(0.95 * Math.pow(exp, 1/2.6)))} | EXP to lvl: ${(Math.ceil(Math.pow((lvl+1) / 0.95, 2.6)) - exp)}`);
	}
	
	//return Math.max(1,Math.floor(0.95 * Math.pow(exp, 1/2.6)));
	return Math.max(1,Math.floor(0.3 * Math.sqrt(exp)));
}

function calculateNextLevelExp(lvl, exp) {
	//return (Math.ceil(Math.pow((lvl+1) / 0.95, 2.6)) - exp);
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

function getAccountDisplayName(name) {
	switch(name.toLowerCase()) {
		case 'steam':
			return "Steam";
			break;
		case 'epic':
			return "Epic";
			break;
		case 'origin':
			return "Origin";
			break;
		case 'bnet':
		case 'battle.net':
			return "Battle.net";
			break;
		case 'league':
		case 'lol':
			return "LoL";
			break;
		case 'activision':
			return "Activision";
			break;
		case 'playstation':
		case 'psn':
			return "Playstation Network";
			break;
		case 'xbl':
		case 'xbox':
			return "Xbox Live";
			break;
		case 'switch':
		case 'friendcode':
			return "Switch Friend Code";
			break;
		default:
			return name;
	}
}

function getAccountNiceName(name) {
	switch(name.toLowerCase()) {
		case 'steam':
			return "steam";
			break;
		case 'epic':
			return "epic";
			break;
		case 'origin':
			return "origin";
			break;
		case 'bnet':
		case 'battle.net':
			return "bnet";
			break;
		case 'league':
		case 'lol':
			return "lol";
			break;
		case 'activision':
			return "activision";
			break;
		case 'playstation':
		case 'psn':
			return "psn";
			break;
		case 'xbl':
		case 'xbox':
			return "xbox";
			break;
		case 'switch':
		case 'friendcode':
			return "switch";
			break;
		default:
			return name;
	}
}

module.exports = {
	calculateNewExp,
	calculateActionExp,
	calculateLevel,
	handleLevelRoles,
	calculateNextLevelExp,
	validURL,
	domainNameMatches,
	calculateActionCurrency,
	getAccountDisplayName,
	getAccountNiceName
};