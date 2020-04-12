const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a Team War Team database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const storePurchaseSchema = new Schema({
		userId: String,
		storeItemId: String,
		paid: { type: Number, default: 0, min: 0 },
		purchased: {type: Date, default: new Date()},
		expires: Date,
		active: { type: Boolean, default: true }
	});

	storePurchaseSchema.statics.createStorePurchase = function(userId, storeItemId, paid, subscription) {
		console.log("Creating Store Purchase");
		var now = new Date();

		if(subscription !== undefined && subscription > 0) {
			var exp = new Date();
			exp.setDate(exp.getDate() + subscription);

			var purchase = this.create({userId: userId, storeItemId: storeItemId, paid: paid, purchased: now, expires: exp});
		} else {
			var purchase = this.create({userId: userId, storeItemId: storeItemId, paid: paid, purchased: now});
		}
	};

	storePurchaseSchema.statics.findStorePurchaseById = function(id) {
		console.log("Finding Store Purchase by id, " + id);
		return this.find({triviaId: id}).sort({cost: 'desc'}).exec();
	};

	storePurchaseSchema.statics.findStorePurchaseByUserId = function(id) {
		console.log("Finding Store Purchase by userId, " + id);
		return this.find({triviaId: id}).sort({cost: 'desc'}).exec();
	};


	let StorePurchaseModel = mongoose.model('StorePurchase', storePurchaseSchema);

	StorePurchaseModel.upsert = function(doc){
		console.log(doc);
		return StorePurchaseModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};