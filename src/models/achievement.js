const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines an Achievement model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const achievementSchema = new Schema({
		name: String,
		slug: String,
		description: {type: String, default: "" },
		emoji: String,
		roleId: String,
		hidden: { type: Boolean, default: false },
		active: { type: Boolean, default: true },
		expBonus: { type: Number, default: 0, min: 0 },
		currencyBonus: { type: Number, default: 0, min: 0 },
		//ranks: { type: Map,of: String }
		ranks: { type: Array, of: Number },
		rankValueType: String
	});

	achievementSchema.statics.findAll = function() {
		console.log("Finding All Achievements");
		return this.find().exec();
	};

	achievementSchema.statics.findById = function(id) {
		console.log("Finding Achievement by ID (" + id +")");
		return this.findOne({_id: id}).exec();
	};

	achievementSchema.statics.findInIds = function(ids) {
		return this.find({_id: {$in:ids} }).exec();
	}

	achievementSchema.statics.findByName = function(n) {
		console.log("Finding Achievement by name (" + CoreUtil.slugify(n) + ")");
		return this.findOne({slug: CoreUtil.slugify(n)}).exec();
	};

	achievementSchema.statics.findHighestLevelByType = function(n) {
		console.log("Finding highest level Achievement by name (" + n + ")");
		return this.findOne({name: n}).sort({level: 'desc'}).exec();
	};

	achievementSchema.statics.findLowestByValueType = function(n, v) {
		console.log("Finding lowest valye Achievement (" + v + ") by name (" + n + ")");
		return this.findOne({name: n, value : {"$gte": v}}).sort({value: 'asc'}).exec();
	};

	achievementSchema.methods.addRank = function (t) {
		this.ranks.push(t);
		this.ranks.sort(sortNumber);
	}

	achievementSchema.methods.removeRank = function (t) {
		CoreUtil.removeArrayItemByValue(this.ranks, t);
	}

	let AchievementModel = mongoose.model('Achievement', achievementSchema);

	AchievementModel.upsert = function(doc){
		console.log(doc);
		return AchievementModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}

	sortNumber = function(a, b) {
		return a - b;
	}
};