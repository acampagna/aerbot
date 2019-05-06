const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
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

	groupSchema.statics.findGroupByName = async function(name) {
		// A bit of a workaround, couldn't use $where due to variable scope restrictions
		// https://docs.mongodb.com/manual/reference/operator/query/where/#restrictions
		const groups = await this.find().exec();
		const regex = new RegExp(CoreUtil.stripPunctuation(name), 'i');
		return groups.find(group => regex.test(CoreUtil.stripPunctuation(group.name)));
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