const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");

module.exports = new Command({
	name: "alts",
	description: "List a member's character names or add/remove your own characters to directory",
	syntax: "alts",
	admin: false,
	invoke
});

async function invoke({ message, params, serverData, client }) {
    if (params.length === 0) {
        const embed = new Discord.RichEmbed();
        embed.setColor("BLUE");
        embed.setTitle(`__Alts__`);
        embed.setDescription(`
            Usage:
            - **!alts <name>** to lookup characters belonging to this member, can use Discord name or ROM main/alt name
            - **!alts add <name>** to add a name to your list of characters
            - **!alts remove <name>** to remove a name from your list of characters
            `);
        return { embed };
    }

    let user = await User.findById(message.member.id).exec();
    const subcommand = params[0].toLowerCase();
    if (subcommand === "add") {
        if (params.length < 2) {
            return "Usage: !alts add <name>";
        }
        const name = params.slice(1).join(" ");
        const userWithCharacter = await User.byCharacter(name);
        if (userWithCharacter) {
            return user.username === message.member.displayName ?
                `You already claimed __${name}__!` :
                `__${name}__ is already claimed by ${userWithCharacter.username}!`;
        }
        user = await user.addCharacter(name);
        return `Added __${name}__ to your characters: [${user.characters.join(", ")}]`;
    } else if (subcommand === "remove") {
        if (params.length < 2) {
            return "Usage: !alts remove <name>";
        }
        const name = params.slice(1).join(" ").toLowerCase();
        if (!user.characters.map(c => c.toLowerCase()).includes(name)) {
            return `__${name}__ is not in your character list!`;
        }
        user = await user.removeCharacter(name);
        return `Removed __${name}__ from your characters: [${user.characters.join(", ")}]`;
    } else {
        const name = params.join(" ");
        const userWithName = await User.byId(name) || await User.byUsername(name) || await User.byCharacter(name);
        if (userWithName) { 
            const embed = new Discord.RichEmbed();
            embed.setColor("BLUE");
            embed.setTitle(`__${userWithName.username}__`);
            embed.setDescription(`Characters: [${userWithName.characters.join(", ")}]`);
            return { embed };
        } else {
            return `No one has the name __${name}__.`;
        }
    }
}