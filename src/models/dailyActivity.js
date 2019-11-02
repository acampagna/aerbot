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
		//console.log("Adding Daily Activity");
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

	dailyActivitySchema.statics.getStatistics = function() {
		console.log("Getting Monthly Statistics");

		var _this = this;

		var userActivity = new Map();
		var typeActivity = new Map();
		return new Promise(function(resolve, reject) {
			_this.find().exec().then(activities => {
				activities.forEach(activity =>{
					var uid = activity.userId;
					var type = activity.type;
					var xp = activity.exp;

					if(userActivity.has(uid)) {
						var ua = userActivity.get(uid);
						ua.has(type) ? ua.set(type, ua.get(type)+xp) : ua.set(type, xp);
					} else {
						userActivity.set(uid, new Map([[type,xp]]));
					}

					if(typeActivity.has(type)) {
						typeActivity.set(type, typeActivity.get(type)+xp);
					} else {
						typeActivity.set(type, xp);
					}
				});

				var userActivityTotals = Array();
				var activeUsers = userActivity.size;

				userActivity.forEach(ua => {
					var total = 0;
					Array.from(ua.values()).forEach(val => total += val);

					userActivityTotals.push(total);
				});

				//console.log(userActivityTotals);

				if(isNaN(typeActivity.get("event"))) {
					typeActivity.set("event", 0);
				}

				if(isNaN(typeActivity.get("voice"))) {
					typeActivity.set("voice", 0);
				}

				typeActivity.set("total", typeActivity.get("message") + typeActivity.get("reaction") + typeActivity.get("event") + typeActivity.get("voice"));

				var avgExp = typeActivity.get("total") / activeUsers;

				//console.log({userActivity: userActivity, typeActivity: typeActivity});
				resolve (
					{
						userActivity: userActivity, 
						typeActivity: typeActivity, 
						activeUsers: activeUsers,
						avgExp: avgExp
					}
				);
			});
		});
	}

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