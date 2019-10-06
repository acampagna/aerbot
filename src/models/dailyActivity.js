const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a daily activity database model. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const dailyActivitySchema = new Schema({
		userId: String,
		//username: String,
		type: String,
		exp: { type: Number, default: 0, min: 0 }
	});

	dailyActivitySchema.statics.add = function(userId, type, exp) {
		console.log("Adding Daily Activity");
		this.create({userId: userId, type: type, exp: exp});
	};

	dailyActivitySchema.statics.findByUserId = function(id) {
		console.log("Finding all activity by userId");
		return this.find({userId: id}).exec();
	};

	dailyActivitySchema.statics.findByUserIdType = function(id, type) {
		console.log("Finding activity by userId and type");
		return this.find({userId: id, type: type}).exec();
	};

	dailyActivitySchema.statics.findAllActivity = function() {
		console.log("Finding ALL Activity");
		return this.find().exec();
	};

	dailyActivitySchema.statics.findActivityByType = function() {
		console.log("Finding activity by type");
		return this.find({type: type}).exec();
	};

	let DailyActivityModel = mongoose.model('DailyActivity', dailyActivitySchema);

	DailyActivityModel.upsert = function(doc){
		console.log(doc);
		return DailyActivityModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};