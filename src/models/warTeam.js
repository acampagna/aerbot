const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a Team War Team database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const warTeamSchema = new Schema({
		_id: String,
		name: String,
		captainId: String,
		emojiId: String,
		warId: String,
		roleId: String,
		channelId: String,
		active: Boolean,
		members: { type: Array, of: String }
	});

	warTeamSchema.statics.findAllTeams = function() {
		console.log("Finding Teams");
		return this.find().exec();
	};

	warTeamSchema.methods.addMember = function (userId) {
		return this.model('WarTeam').findOneAndUpdate(
			{_id: this.id},
			{$addToSet: {members: userId}},
			{new: true}).exec();
	}

	warTeamSchema.methods.removeMember = function (userId) {
		return this.model('WarTeam').findOneAndUpdate(
			{_id: this.id},
			{$pull: {members: userId}},
			{new: true}).exec();
	}

	let WarTeamModel = mongoose.model('WarTeam', warTeamSchema);

	WarTeamModel.upsert = function(doc){
		console.log(doc);
		return WarTeamModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};