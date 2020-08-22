const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");

module.exports = new Command({
	name: "currency",
	description: "Adds or subtracts currency from a member",
	syntax: "currency",
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
	if(message.mentions.users.first()) {
		var memberId = message.mentions.users.first().id;
	} else if(params[0]){
		var memberId = params[1];
	}

	if (!isNaN(params[0])) {
		User.byId(memberId).then(user => {
			user.currency += parseInt(params[0]);
			user.save();
			//console.log(user);
		});
		return Promise.resolve("Adjusted " + message.mentions.users.first() + "'s currency by " + params[0]);
	} else {
		return Promise.resolve("You must supply a currency amount and @mention a user to give/take bonus currency");
	}
}