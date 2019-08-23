const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a server database model. Servers are servers in Discord.
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const guildSchema = new Schema({
		name: String,
		game: String,
		emoji: String,
		server_id: String,
		member_role_id: String
	});

	guildSchema.statics.findAllGuilds = function() {
		return this.find().exec();
	};

	guildSchema.methods.updateMemberRoleId = function (roleId) {
		this.model('Guild').updateOne({_id: this.id},{member_role_id: roleId}, {new: true}).exec();
	};

	guildSchema.methods.updateOfficerRoleId = function (roleId) {
		this.model('Guild').updateOne({_id: this.id},{OfficerRoleId: roleId}, {new: true}).exec();
	};

	guildSchema.methods.updateEmoji = function (emojiId) {
		this.model('Guild').updateOne({_id: this.id},{emoji: emojiId}).exec();
	};

	guildSchema.methods.updateGame = function (name) {
		this.model('Guild').updateOne({_id: this.id},{game: name}).exec();
	};

	guildSchema.methods.updateName = function (name) {
		this.model('Guild').updateOne({_id: this.id},{name: name}).exec();
	};

	//TODO: Fix to WelcomeRoleId
	guildSchema.methods.updateWelcomeRole = function (roleId) {
		this.model('Guild').updateOne({_id: this.id},{welcomeRole: roleId}).exec();
	};

	guildSchema.methods.updateWelcomeChannelId = function (channelId) {
		this.model('Guild').updateOne({_id: this.id},{welcomeChannelId: channelId}).exec();
	};

	guildSchema.statics.byName = function(name) {
		return this.findOne({ name: new RegExp(`^${name}$`, 'i') }).exec();
	};

	let GuildModel = mongoose.model('Guild', guildSchema);

	GuildModel.upsert = function(doc){
		return ServerModel.findOneAndUpdate(
			{_id: doc._id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};