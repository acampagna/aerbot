const CoreUtil = require("./utils/Util.js");
const InternalConfig = require("./internal-config.json");
const RequireAll = require("require-all");

const cmdPrefix = InternalConfig.commandPrefix;

function handleGuildMessage(client, message, commands) {
	if (isCommand(message))
		client.guildModel.findById(message.guild.id).exec()
			.then(guildData =>
				handleGuildCommand(
					client,
					message,
					Object.assign({}, commands),
					guildData
				));
}

function handleGuildCommand(client, message, commands, guildData) {
	const { botName, isMemberAdmin, params, command } = parseDetails(message, commands, guildData);

	//CoreUtil.dateLog(`Command: `,command);
	if (!command) {
		CoreUtil.dateLog("Not a command");
		return;
	}
		

	if (params.length < command.expectedParamCount)
		message.reply(`Incorrect syntax!\n**Expected:** *${botName} ${command.syntax}*\n**Need help?** *${botName} help*`);

	else if (isMemberAdmin || !command.admin) {
		command.invoke({ message, params, guildData, client, commands, isMemberAdmin })
		.then(response => {
			if (typeof response === 'object' && response.everyone && response.message) {
				if(response.everyone) {
					message.channel.send("@everyone", { embed: response.message });
				}
			} else {
				if(response) {
					message.reply(response);
				}
			}
		})
		.catch(err => err && message.reply(err));
	}
}

function parseDetails(message, commands, guildData) {
	let cmdPos = 1;
	if(message.content.substring(0, 1) === cmdPrefix) {
		message.content = message.content.substring(1);
		cmdPos = 0;
	}
	const split = message.content.split(/ +/);
	const commandName = Object.keys(commands).find(x => commands[x].name.toLowerCase() === (split[cmdPos] || "").toLowerCase());

	return {
		botName: "@" + (message.guild.me.nickname || message.guild.me.user.username),
		//isMemberAdmin: message.member.permissions.has("ADMINISTRATOR") || message.member.roles.get(guildData.officerRoleID),
		isMemberAdmin: message.member.permissions.has("ADMINISTRATOR"),
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

module.exports = handleGuildMessage;