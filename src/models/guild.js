const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a guild database model. Guilds are servers in Discord.
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const guildSchema = new Schema({
		_id: String,
		officerRoleId: String,
		memberRoleId: String,
		groupCategory: String,
		welcomeRole: String,
		welcomeChannelId: String
	});

	guildSchema.methods.updateMemberRoleId = function (roleId) {
		this.model('Guild').updateOne({_id: this.id},{memberRoleId: roleId}).exec();
	};

	guildSchema.methods.updateOfficerRoleId = function (roleId) {
		this.model('Guild').updateOne({_id: this.id},{OfficerRoleId: roleId}).exec();
	};

	guildSchema.methods.updateGroupCategory = function (categoryId) {
		this.model('Guild').updateOne({_id: this.id},{groupCategory: categoryId}).exec();
	};

	//TODO: Fix to WelcomeRoleId
	guildSchema.methods.updateWelcomeRole = function (roleId) {
		this.model('Guild').updateOne({_id: this.id},{welcomeRole: roleId}).exec();
	};

	guildSchema.methods.updateWelcomeChannelId = function (channelId) {
		this.model('Guild').updateOne({_id: this.id},{welcomeChannelId: channelId}).exec();
	};

	let GuildModel = mongoose.model('Guild', guildSchema);

	GuildModel.upsert = function(doc){
		return GuildModel.findOneAndUpdate(
			{_id: doc._id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};