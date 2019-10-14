const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a monthly activity database model. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const monthlyActivitySchema = new Schema({
		userId: String,
		//username: String,
		type: String,
		//numActivities: { type: Number, default: 0, min: 0 },
		exp: { type: Number, default: 0, min: 0 },
		date: {type: Date, default: new Date()},
	});

	monthlyActivitySchema.statics.add = function(userId, type, exp) {
		//console.log("Adding Monthly Activity");
		this.create({userId: userId, type: type, exp: exp});
	};

	monthlyActivitySchema.statics.addMap = function(userId, map) {
		console.log("Adding Monthly Activity from Map()");
		var _this = this;
		map.forEach(function(value, key) {
			_this.create({userId: userId, type: key, exp: value});
		});
	};

	monthlyActivitySchema.statics.findByUserId = function(id) {
		console.log("Finding all Monthly activity by userId");
		return this.find({userId: id}).exec();
	};

	monthlyActivitySchema.statics.findByUserIdType = function(id, type) {
		console.log("Finding Monthly activity by userId and type");
		return this.find({userId: id, type: type}).exec();
	};

	monthlyActivitySchema.statics.findAllActivity = function() {
		console.log("Finding ALL Monthly Activity");
		return this.find().exec();
	};

	monthlyActivitySchema.statics.findActivityByType = function() {
		console.log("Finding Monthly activity by type");
		return this.find({type: type}).exec();
	};

	let MonthlyActivityModel = mongoose.model('MonthlyActivity', monthlyActivitySchema);

	MonthlyActivityModel.upsert = function(doc){
		console.log(doc);
		return MonthlyActivityModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};