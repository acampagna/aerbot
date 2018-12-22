const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
const mongoose = require('mongoose');
const { Model, Schema } = mongoose

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