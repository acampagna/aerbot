const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = new Command({
	name: "referrer",
	description: "Set who recruited you to the Dauntless discord server",
	syntax: "referrer",
	admin: false,
	invoke
});

function invoke({ message, params, guildData, client }) {
	if (message.mentions.members.size > 0) {
		return new Promise(function(resolve, reject) {
			let referrer = message.mentions.members.first();
			User.findById(message.member.id).exec().then(user => {
				user.updateReferrer(referrer.id);
			});
			resolve("Successfully set " + referrer.displayName + " as your referrer. Thank You!");
		});
	} else {
		return Promise.resolve("You must @mention an existing users");
	}
}
