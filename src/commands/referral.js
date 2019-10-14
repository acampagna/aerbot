const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = new Command({
	name: "referral",
	description: "Set who recruited you to the Dauntless discord server",
	syntax: "referral",
	admin: false,
	invoke
});

/**
 * Set who referred you to the community
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	if (message.mentions.members.size > 0) {
		return new Promise(function(resolve, reject) {
			let referrer = message.mentions.members.first();
			User.findById(message.member.id).exec().then(user => {
				user.updateReferrer(referrer.id);
			});

			User.countDocuments({referrer: referrer.id}, function (err, count) {
				resolve(referrer + " now has **" + (count+1) + "** referrals. Your friend thanks you!");
			});

			//resolve("Successfully set " + referrer + " as your referrer. Thank You!");
		});
	} else {
		return new Promise(function(resolve, reject) {
			User.countDocuments({referrer: message.member.id}, function (err, count) {
				resolve(" has referred " + count + " members.\n\nTo identify who referred you please use this command and @mention your referrer. i.e. `!referrer @Aerbot`");
			});
		});
		//return Promise.resolve("You must @mention an existing user. i.e. `!referrer " + message.member + "`");
	}
}
