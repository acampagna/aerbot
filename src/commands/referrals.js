const CoreUtil = require("../utils/Util.js");
const MemberUtil = require("../utils/MemberUtil.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const DateDiff = require("date-diff");
const Achievement = mongoose.model('Achievement');
const AchievementService = require("../services/AchievementService");

const AS = new AchievementService();

module.exports = new Command({
	name: "referrals",
	description: "Find out information about referrals",
	syntax: "referrals",
	admin: true,
	invoke
});

async function invoke({ message, params, serverData, client }) {
	return new Promise(async function(resolve, reject) {
		if(message.mentions.users.first()) {
			var memberId = message.mentions.users.first().id;
		} else if(params[0]){
			var memberId = params[0];
		} else {
			var memberId = message.member.id;
			getAdminStats = false;
		}

		var referrals = await User.findUsersReferrals(memberId);
		resolve ("Total Qualified Referrals: " + referrals.length);
	});
}