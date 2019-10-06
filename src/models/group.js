const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a group database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const groupSchema = new Schema({
		guildId: String,
		roleId: String,
		channelId: String,
		name: String,
		type: String,
		emoji: String,
		genre: String,
		platforms: { type: Array, of: String },
		genres: { type: Array, of: String },
		list: {type: Boolean, default: true},
		numMembers: {type: Number, default: 0},
		memberIds: { type: Array, of: String },
		public: {type: Boolean, default: true}
	});

	groupSchema.methods.incrementNumMembers = function () {
		this.model('Group').updateOne({_id: this.id},{numMembers: this.numMembers+1}).exec();
	};

	groupSchema.methods.decrementNumMembers = function () {
		this.model('Group').updateOne({_id: this.id},{numMembers: this.numMembers-1}).exec();
	};

	/*groupSchema.statics.findGroupById = function(id) {
		id = id.toString().replace(/\D/g,'');
		return this.findById(id).exec();
	};*/

	groupSchema.statics.findGroupById = function(id) {
		console.log("Finding group by ID");
		return this.findOne({_id: id}).exec();
	};

	groupSchema.statics.findGroupByName = function(name) {
		console.log("Finding group by name");
		return this.findOne({name: new RegExp(name, 'i')}).exec();
	};

	groupSchema.statics.findGroupByEmoji = function(emoji) {
		console.log("Finding group by emoji");
		return this.findOne({emoji: new RegExp(emoji, 'i')}).exec();
	};

	groupSchema.statics.findGroupByType = function(type) {
		console.log("Finding group by type");
		return this.findOne({type: type}).exec();
	};

	groupSchema.statics.findAllGroups = function() {
		return this.find().exec();
	};

	groupSchema.statics.findAllPublicGroups = function() {
		return this.find({public: true}).exec();
	};

	groupSchema.statics.findAllUsersByGroupName = function(name) {
		return this.find().exec();
	}

	groupSchema.methods.addMember = function (groupName, userId) {
		return this.model('Group').findOneAndUpdate(
			{name: new RegExp(groupName, 'i')},
			{$addToSet: {memberIds: userId}},
			{new: true}).exec();
	}

	groupSchema.methods.removeMember = function (groupName, userId) {
		return this.model('Group').findOneAndUpdate(
			{name: new RegExp(groupName, 'i')},
			{$pull: {memberIds: userId}},
			{new: true}).exec();
	}

	groupSchema.methods.addPlatform = function (groupName, groupId) {
		return this.model('Group').findOneAndUpdate(
			{name: new RegExp(groupName, 'i')},
			{$addToSet: {platforms: groupId}},
			{new: true}).exec();
	}

	groupSchema.methods.removePlatform = function (groupName, groupId) {
		return this.model('Group').findOneAndUpdate(
			{name: new RegExp(groupName, 'i')},
			{$pull: {platforms: groupId}},
			{new: true}).exec();
	}

	groupSchema.methods.addGenre = function (groupName, groupId) {
		return this.model('Group').findOneAndUpdate(
			{name: new RegExp(groupName, 'i')},
			{$addToSet: {genres: groupId}},
			{new: true}).exec();
	}

	groupSchema.methods.removeGenre = function (groupName, groupId) {
		return this.model('Group').findOneAndUpdate(
			{name: new RegExp(groupName, 'i')},
			{$pull: {genres: groupId}},
			{new: true}).exec();
	}

	let GroupModel = mongoose.model('Group', groupSchema);

	GroupModel.upsert = function(doc){
		console.log(doc);
		return GroupModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};