/**
 * Handles a message
 * TAKEN FROM SOME TUTORIAL BOT. MADE MINOR MODIFICATIONS.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */


 //I want to modify this to work more like this bot's commands. Plus add Aliases:
 //https://github.com/izio38/Discord.js-bot-example/tree/master/commands
const CoreUtil = require("./utils/Util.js");
const InternalConfig = require("./internal-config.json");
const RequireAll = require("require-all");
const Levenshtein = require('js-levenshtein');

const cmdPrefix = InternalConfig.commandPrefix;

function handleServerMessage(client, message, commands) {
	if (isCommand(message))
		client.serverModel.findById(message.guild.id).exec()
			.then(serverData =>
				handleServerCommand(
					client,
					message,
					Object.assign({}, commands),
					serverData
				));
}

function handleServerCommand(client, message, commands, serverData) {
	const { botName, isMemberAdmin, params, command } = parseDetails(message, commands, serverData);

	//CoreUtil.dateLog("SERVER DATA:");
	//CoreUtil.dateLog(serverData);

	//CoreUtil.dateLog(`Command: `,command);
	if (!command) {
		CoreUtil.dateLog("Not a command");
		return;
	}
		

	if (params.length < command.expectedParamCount)
		message.reply(`Incorrect syntax!\n**Expected:** *${botName} ${command.syntax}*\n**Need help?** *${botName} help*`);

	else if (isMemberAdmin || !command.admin) {
		command.invoke({ message, params, serverData, client, commands, isMemberAdmin })
		.then(response => {
			if (typeof response === 'object' && (response.everyone || response.here)) {
				if(response.everyone && response.message) {
					message.channel.send("@everyone", { embed: response.message });
				} else if(response.here && response.message) {
					message.channel.send("@here", { embed: response.message });
				}
			} else if (typeof response === 'object' && response.reactions) {
				message.channel.send(response.message).then(function (message) {
					if(response.reactions) {
						response.reactions.forEach(data => {
							message.react(data);
						});
					}
				}).catch(function() {
					//Something
				});
		    } else {
				if(response && response != "") {
					message.reply(response);
				}
			}
		})
		.catch(err => err && message.reply(err));
	}
}

function parseDetails(message, commands, serverData) {
	let cmdPos = 1;
	if(message.content.substring(0, 1) === cmdPrefix) {
		message.content = message.content.substring(1);
		cmdPos = 0;
	}
	const split = message.content.split(/ +/);
	const commandName = Object.keys(commands).find(x => commands[x].name.toLowerCase() === (split[cmdPos] || "").toLowerCase());

	return {
		botName: "@" + (message.guild.me.nickname || message.guild.me.user.username),
		isMemberAdmin: message.member.permissions.has("ADMINISTRATOR") || message.member.roles.get(serverData.moderatorRoleId),
		//isMemberAdmin: message.member.permissions.has("ADMINISTRATOR"),
		params: split.slice(cmdPos+1, split.length),
		command: commands[commandName]
	};
}

function isCommand(message) {
	//criteria for a command is bot being mentioned 
	if(message.content.substring(0, 1) === cmdPrefix){
		return true;
	} else {
		return new RegExp(`^<@!?${/[0-9]{18}/.exec(message.guild.me.toString())[0]}>`).exec(message.content);
	}
}

module.exports = handleServerMessage;