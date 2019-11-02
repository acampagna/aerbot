const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");

module.exports = new Command({
	name: "event",
	description: "Gives event credit to a member",
	syntax: "event",
	admin: true,
	invoke
});

/**
 * Sets and displays accounts for a member. Currently we use a single default for setting and displaying.
 * UNFINISHED. NEEDS CLEANUP. NEEDS TO BE FINISHED.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	if (message.mentions.members.size > 0) {
		var ids = new Array();
		var nameMentions = "";
		message.mentions.members.forEach(mention => {
			ids.push(mention.id);
			nameMentions += mention + " ";
		});
		User.findInIds(ids).then(users => {
			users.forEach(user => {
				console.log(user.username);
				var server = client.guilds.get(message.guild.id);
				HandleActivity(client,server,{event: true},user);
			});
		});
		return Promise.resolve("Gave 50 exp for participating in an event to " + nameMentions);
	} else {
		return Promise.resolve("You must @mention at least 1 user to give event credit to.");
	}
}