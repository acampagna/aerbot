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

	const prizeSchema = new Schema({
		name: String,
		slug: String,
		key: String,
		category: String,
		active: {type: Boolean, default: true },
		value: { type: Number, default: 0, min: 0 }
	});

	prizeSchema.statics.findAll = function() {
		console.log("Finding All Prize");
		return this.find().exec();
	};

	prizeSchema.statics.findAllMaxValue = function(maxValue) {
		console.log("Finding All Prize Less than $" + maxValue);
		return this.find({value : {"$lte": maxValue}, "$or": [{active: true}, {active : { $exists: false }}]}).sort({name: 'asc'}).exec();
	};

	prizeSchema.statics.addPrize = function(name, key, value, category) {
		console.log("Adding Prize");
		this.create({name: name, slug: CoreUtil.slugify(name), key: key, value: value, category: category});
	};

	prizeSchema.statics.findPrizeById = function(id) {
		console.log("Finding Prize by id, " + id);
		return this.find({_id: id}).sort({cost: 'desc'}).exec();
	};

	prizeSchema.statics.findPrizeByName = function(n) {
		console.log("Finding Prize by name (" + CoreUtil.slugify(n) + ")");
		return this.findOne({slug: CoreUtil.slugify(n)}).exec();
	};

	prizeSchema.statics.giveRandomPrize = async function(minValue, maxValue) {
		const count = await this.countDocuments({"$and": [{value : {"$gte": minValue}}, {value : {"$lte": maxValue}}, {"$or": [{active: true}, {active : { $exists: false }}]}]});
		console.log("Count: " + count);
		const rand = Math.floor(Math.random() * count);
		console.log("min: " + minValue + " max: " + maxValue + " rand: " + rand);
		const randomDoc = await this.findOne({"$and": [{value : {"$gte": minValue}}, {value : {"$lte": maxValue}}, {"$or": [{active: true}, {active : { $exists: false }}]}]}).skip(rand);

		if(randomDoc) {
			console.log("Made " + randomDoc.key + " inactive!");
			randomDoc.active = false;
			randomDoc.save();

			return randomDoc;
		}
	};

	prizeSchema.statics.givePrizeByName = async function(n) {
		console.log("Finding Prize by name (" + CoreUtil.slugify(n) + ")");
		const p = await this.findOne({slug: CoreUtil.slugify(n)});
		if(p) {
			p.active = false;
			p.save();
		}
		
		return p;
	};

	let PrizeModel = mongoose.model('Prize', prizeSchema);

	PrizeModel.upsert = function(doc){
		console.log(doc);
		return PrizeModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};