const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a server database model. Servers are servers in Discord.
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const serverSchema = new Schema({
		_id: String,
		officerRoleId: String,
		memberRoleId: String,
		groupCategory: String,
		welcomeRole: String,
		welcomeChannelId: String
	});

	serverSchema.methods.updateMemberRoleId = function (roleId) {
		this.model('Server').updateOne({_id: this.id},{memberRoleId: roleId}).exec();
	};

	serverSchema.methods.updateOfficerRoleId = function (roleId) {
		this.model('Server').updateOne({_id: this.id},{OfficerRoleId: roleId}).exec();
	};

	serverSchema.methods.updateGroupCategory = function (categoryId) {
		this.model('Server').updateOne({_id: this.id},{groupCategory: categoryId}).exec();
	};

	//TODO: Fix to WelcomeRoleId
	serverSchema.methods.updateWelcomeRole = function (roleId) {
		this.model('Server').updateOne({_id: this.id},{welcomeRole: roleId}).exec();
	};

	serverSchema.methods.updateWelcomeChannelId = function (channelId) {
		this.model('Server').updateOne({_id: this.id},{welcomeChannelId: channelId}).exec();
	};

	let ServerModel = mongoose.model('Server', serverSchema);

	ServerModel.upsert = function(doc){
		return ServerModel.findOneAndUpdate(
			{_id: doc._id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};