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
		list: {type: Boolean, default: true},
		numMembers: {type: Number, default: 0}
	});

	groupSchema.methods.incrementNumMembers = function () {
		this.model('Group').updateOne({_id: this.id},{numMembers: this.numMembers+1}).exec();
	};

	groupSchema.methods.decrementNumMembers = function () {
		this.model('Group').updateOne({_id: this.id},{numMembers: this.numMembers-1}).exec();
	};

	groupSchema.statics.findGroupByName = function(name) {
		return this.findOne({name: new RegExp(name, 'i')}).exec();
	};

	groupSchema.statics.findAllGroups = function() {
		return this.find().exec();
	};

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