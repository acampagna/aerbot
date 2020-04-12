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

	const storeItemSchema = new Schema({
		itemId: { type: Number, default: 0 },
		name: String,
		slug: String,
		description: String,
		//lastPurchaser: String,
		cost: { type: Number, default: 0, min: 0 },
		value: { type: Number, default: 0, min: 0 },
		purchases: { type: Number, default: 0, min: 0 },
		active: { type: Boolean, default: false },
		imgUrl: String,
		requirements: { type: Map, of: String },
	});

	storeItemSchema.statics.findAll = function() {
		console.log("Finding All Store Items");
		return this.find().exec();
	};

	storeItemSchema.statics.createStoreItem = function(name, cost, description) {
		console.log("Creating Store Purchase");
		this.create({name: name, slug: CoreUtil.slugify(name), cost: cost, description: description});
	};

	storeItemSchema.statics.findStoreItemById = function(id) {
		console.log("Finding Store Item by id, " + id);
		return this.find({_id: id}).sort({cost: 'desc'}).exec();
	};

	storeItemSchema.statics.findStoreItemByName = function(n) {
		console.log("Finding Store Item by name (" + CoreUtil.slugify(n) + ")");
		return this.findOne({slug: CoreUtil.slugify(n)}).exec();
	};

	let StoreItemModel = mongoose.model('StoreItem', storeItemSchema);

	StoreItemModel.upsert = function(doc){
		console.log(doc);
		return StoreItemModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};