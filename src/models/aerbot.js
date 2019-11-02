const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a server database model. Servers are servers in Discord.
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const aerbotSchema = new Schema({
		key: String,
		value: String
	});
	
	aerbotSchema.statics.get = function (key) {
		return this.model('Aerbot').findOne({key: key}).exec();
	}

	aerbotSchema.statics.getVal = function (key) {
		console.log("Aerbot getVal");
		this.model('Aerbot').findOne({key: key}).exec().then(meta => { 
			console.log("Value: " + meta.value);
			return meta.value; 
		});
	}

	aerbotSchema.statics.set = function (key, value) {
		return this.model('Aerbot').findOneAndUpdate(
			{key: key},
			{key: key, value: value},
			{upsert: true, new: true}).exec();
	}

	let AerbotModel = mongoose.model('Aerbot', aerbotSchema);

	AerbotModel.upsert = function(doc){
		return AerbotModel.findOneAndUpdate(
			{key: doc.key},
			doc, 
			{upsert: true, new: true, runValidators: true}
		).exec();
	}
};