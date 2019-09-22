const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a spotlight database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const spotlightSchema = new Schema({
		guildId: String,
		roleId: String,
		channelId: String,
		name: String,
		type: String,
		emoji: String,
		genre: String,
		platforms: { type: Array, of: String },
		list: {type: Boolean, default: true},
		numMembers: {type: Number, default: 0},
		memberIds: { type: Array, of: String }
	});

	spotlightSchema.statics.findGroupById = function(id) {
		console.log("Finding spotlight by ID");
		return this.findOne({_id: id}).exec();
	};

	spotlightSchema.statics.findGroupByName = function(name) {
		console.log("Finding spotlight by name");
		return this.findOne({name: new RegExp(name, 'i')}).exec();
	};

	let SpotlightModel = mongoose.model('Spotlight', spotlightSchema);

	SpotlightModel.upsert = function(doc){
		console.log(doc);
		return SpotlightModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};