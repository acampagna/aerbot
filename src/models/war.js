const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a Team War database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const warSchema = new Schema({
		categoryId: String,
		teams: { type: Array, of: String }
	});

	warSchema.statics.findWar = function() {
		console.log("Finding War");
		return this.findOne({}).exec();
	};

	let warModel = mongoose.model('War', warSchema);

	warModel.upsert = function(doc){
		console.log(doc);
		return warModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};