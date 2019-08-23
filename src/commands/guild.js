const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Guild = mongoose.model('Guild');
const GuildService = require("../services/GuildService");

module.exports = new Command({
	name: "guild",
	description: "Everything for guilds",
	syntax: "command config_value",
	admin: true,
	invoke
});

const gs = new GuildService();

/**
 * Create, configure, delete guilds
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	var nparams = parseParams(params);
	console.log("nparams", nparams);

	switch(params[0]) {
		case 'create':
			var guildName = params.slice(1).join(" ");
			if (guildName.length > 0) {
				createGuild(guildName, message);
				return Promise.resolve("guild " + guildName + " created");
			} else {
				return Promise.resolve("You must specify a name.");
			}
			break;
		case 'delete':
			var guildName = params.slice(1).join(" ");
			if (guildName.length > 0) {
				deleteGuild(guildName);
				return Promise.resolve("guild " + guildName + " deleted");
			} else {
				return Promise.resolve("You must specify a name.");
			}
			break;
		case 'list':
			return Promise.resolve(gs.listGuilds());
			break;
		case 'set_member_role':
			if (message.mentions.roles.size > 0) {
				Guild.byName(nparams.get("params")[0]).then(guild => {
					guild.updateMemberRoleId(message.mentions.roles.first().id);
				});
			} else {
				return Promise.resolve("You must @mention an existing role");
			}
			break;
		case 'set_emoji':
			if (nparams.get("params")[0] && nparams.get("params")[1]) {
				var emoji = parseEmojiId(nparams.get("params")[1]);
				Guild.byName(nparams.get("params")[0]).then(guild => {
					guild.updateEmoji(emoji);
				});
				message.react(emoji);
			} else {
				return Promise.resolve("You must specify a guild name to change and an emoji.");
			}
			break;
		case 'set_game':
			if (nparams.get("params")[0] && nparams.get("params")[1]) {
				Guild.byName(nparams.get("params")[0]).then(guild => {
					guild.updateGame(nparams.get("params")[1])
				});
			} else {
				return Promise.resolve("You must specify a guild name to change and a game name.");
			}
			break;
		case 'set_name':
		if (nparams.get("params")[0] && nparams.get("params")[1]) {
			Guild.byName(nparams.get("params")[0]).then(guild => {
				guild.updateName(nparams.get("params")[1])
			});
		} else {
			return Promise.resolve("You must specify a guild name to change and a name.");
		}
		break;
		default:
			return Promise.resolve(params[0] + " is an invalid configuration");
	}

	return Promise.resolve(params[0] + " set to " + nparams.get("params")[1]);
}

function createGuild(name, message) {
	Guild.create({_idserver_id: message.guild.id, name: name});
	console.log(`Created new Guild: ${name}`);
}

function deleteGuild(name) {
	Guild.deleteOne({_id: group.id}).exec();
	console.log(`Deleted Guild: ${name}`);
}

function parseParams(params) {
	//var nparams = extractQuotesText(params.join(" "));//.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)//.map(p => p.trim().replace(/\"/g, ""));
	
	var nparams = new Map();

	nparams.set("command", params[0]);
	params = params.slice(1);

	var paramsArr = new Array();
	var inQuote = false;
	var quoteText = "";

	params.forEach(param => {
		/*if(param.includes(":")){
			var colonParam = p.trim().replace(/\"/g, "").split(":").map(m => m.trim());
			nparams.set(colonParam[0].toLowerCase(), colonParam[1]);
		} else {*/

			if(param.charAt(0) === "\"") {
				inQuote = true;
				quoteText += param.slice(1) + " ";
			} else if (param.charAt(param.length-1) === "\"") {
				inQuote = false;
				quoteText += param.slice(0,-1);
				paramsArr.push(quoteText.trim());
			} else {
				if(!inQuote) {
					paramsArr.push(param);
				} else {
					quoteText += param + " ";
				}
			}	
		//}
	});

	nparams.set("params", paramsArr);

	return nparams;
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function getSlug(str) {
	return replaceAll(str," ", "").toLowerCase().trim();
}

function parseEmojiId(str) {
	return str.slice(2).slice(0,-1).split(":")[1];
}