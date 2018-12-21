const Command = require("../Command.js");
const Discord = require("discord.js");
const InternalConfig = require("../internal-config.json");
const ParentPackageJson = require("../../package.json");

module.exports = new Command({
	name: "help",
	description: "Display available commands with descriptions",
	syntax: "help",
	admin: false,
	invoke
});

function invoke({ commands, isMemberAdmin }) {
	return Promise.resolve(createHelpEmbed(InternalConfig.botName, commands, isMemberAdmin));
}

function createHelpEmbed(name, commands, userIsAdmin) {
	const commandsArr = Object.keys(commands).map(x => commands[x]).filter(x => userIsAdmin || !x.admin);

	const embed = new Discord.RichEmbed().setTitle(`__${name} Help__`);

	commandsArr.forEach(command => {
		if(command.name !== undefined && command.name !== "version") {
			embed.addField(command.name, `${command.description}\n**Usage:** *${command.syntax}*${userIsAdmin && command.admin ? "\n***Admin only***" : ""}`);
		}
	});

	//embed.addField("__Need more help?__", `[Visit my website](${InternalConfig.website}) or [Join my Discord](${InternalConfig.discordInvite})`, true);

	return { embed };
}