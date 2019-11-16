const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a Team War Team database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const pinnedSchema = new Schema({
		triviaId: String,
		userId: String,
		points: { type: Number, default: 1, min: 0 }
	});

	pinnedSchema.statics.findTriviaById = function(tid) {
		console.log("Finding trivia by id, " + tid);
		return this.find({triviaId: tid}).sort({points: 'desc'}).exec();
	};

	pinnedSchema.statics.saveOrUpdate = function (tid, uid, pts) {
		this.model('Trivia').updateOne(
			{triviaId: tid, userId: uid},
			{triviaId: tid, userId: uid, $inc: { points: pts }},
			{upsert: true, new: true, setDefaultsOnInsert: true}).exec();
	}

	let PinnedModel = mongoose.model('Pinned', pinnedSchema);

	PinnedModel.upsert = function(doc){
		console.log(doc);
		return PinnedModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};