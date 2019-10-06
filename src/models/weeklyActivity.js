const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a weekly activity database model. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const weeklyActivitySchema = new Schema({
		userId: String,
		//username: String,
		type: String,
		//numActivities: { type: Number, default: 0, min: 0 },
		exp: { type: Number, default: 0, min: 0 },
		date: {type: Date, default: new Date()},
	});

	weeklyActivitySchema.statics.add = function(userId, type, exp) {
		console.log("Adding Weekly Activity");
		this.create({userId: userId, type: type, exp: exp});
	};

	weeklyActivitySchema.statics.addMap = function(userId, map) {
		console.log("Adding Weekly Activity from Map()");
		var _this = this;
		map.forEach(function(value, key) {
			_this.create({userId: userId, type: key, exp: value});
		});
	};

	weeklyActivitySchema.statics.findByUserId = function(id) {
		console.log("Finding all Weekly activity by userId");
		return this.find({userId: id}).exec();
	};

	weeklyActivitySchema.statics.findByUserIdType = function(id, type) {
		console.log("Finding Weekly activity by userId and type");
		return this.find({userId: id, type: type}).exec();
	};

	weeklyActivitySchema.statics.findAllActivity = function() {
		console.log("Finding ALL Weekly Activity");
		return this.find().exec();
	};

	weeklyActivitySchema.statics.findActivityByType = function() {
		console.log("Finding Weekly activity by type");
		return this.find({type: type}).exec();
	};

	let WeeklyActivityModel = mongoose.model('WeeklyActivity', weeklyActivitySchema);

	WeeklyActivityModel.upsert = function(doc){
		console.log(doc);
		return WeeklyActivityModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};