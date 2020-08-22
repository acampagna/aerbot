const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a daily activity database model. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const activitySchema = new Schema({
		userId: String,
		//username: String,
		type: String,
		exp: { type: Number, default: 0, min: 0 },
		date: {type: Date, default: new Date()}
	});

	activitySchema.statics.add = function(userId, type, exp) {
		//console.log("Adding Daily Activity");
		this.create({userId: userId, type: type, exp: exp, date: new Date()});
	};

	activitySchema.statics.findByUserId = function(id) {
		console.log("Finding all activity by userId");
		return this.find({userId: id}).exec();
	};

	activitySchema.statics.findByUserIdType = function(id, type) {
		console.log("Finding activity by userId and type");
		return this.find({userId: id, type: type}).exec();
	};

	activitySchema.statics.findAllActivity = function() {
		console.log("Finding ALL Activity");
		return this.find().exec();
	};

	activitySchema.statics.findAllRecentActivityIn = function(days, ids) {
		console.log("Finding ALL Activity IN");
		var date = new Date();
		date.setDate( date.getDate() - days);
	
		return this.find({"$and": [{userId: {$in:ids}},  {date: {"$gte": date}}]}).exec();
	};

	activitySchema.statics.findActivityByType = function(type) {
		console.log("Finding activity by type");
		return this.find({type: type}).exec();
	};

	activitySchema.statics.findActivitySince = function(days) {
		var date = new Date();
        date.setDate( date.getDate() - days );
		console.log("{\"date\" : {\"$gte\": " + date + "}}");
		return this.find({date : {"$gte": date}}).exec();
	}

	/*activitySchema.statics.getStatistics = function(days, skip) {
		if(skip) {
			console.log("SKIP! | days: " + days + " | skip: " + skip);
			var today = new Date();
			today.setDate(today.getDate() - skip );

			console.log(today);

			var date = new Date(today);
			date.setDate( date.getDate() - days );

			console.log(date);
		} else {
			console.log("NO SKIP!");
			var today = new Date();

			console.log(today);
			
			var date = new Date();
			date.setDate( date.getDate() - days );

			console.log(date);
		}
		
		console.log("Getting Statistics " + "{\"date\" : {\"$gte\": " + date + ", \"$lte\": " + today + "}}");

		var _this = this;

		var userActivity = new Map();
		var typeActivity = new Map();
		return new Promise(function(resolve, reject) {
			_this.find({date : {"$gte": date, "$lte": today}}).exec().then(activities => {
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

				if(isNaN(typeActivity.get("reaction"))) {
					typeActivity.set("reaction", 0);
				}

				if(isNaN(typeActivity.get("message"))) {
					typeActivity.set("message", 0);
				}

				if(isNaN(typeActivity.get("pinned"))) {
					typeActivity.set("pinned", 0);
				}

				if(isNaN(typeActivity.get("trivia"))) {
					typeActivity.set("trivia", 0);
				}

				if(isNaN(typeActivity.get("qotd"))) {
					typeActivity.set("qotd", 0);
				}

				if(isNaN(typeActivity.get("stream"))) {
					typeActivity.set("stream", 0);
				}

				typeActivity.set("total", typeActivity.get("message") + typeActivity.get("achievement") + typeActivity.get("voice") +  typeActivity.get("reaction") + 
					typeActivity.get("pinned") + typeActivity.get("event") + typeActivity.get("trivia") + typeActivity.get("qotd") + typeActivity.get("stream")
				);

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
	}*/

	activitySchema.statics.getStatistics = function(days, userId) {
		var today = new Date();

		console.log(today);
			
		var date = new Date();
		date.setDate( date.getDate() - days );

		console.log(date);
		
		console.log("Getting Statistics " + "{\"date\" : {\"$gte\": " + date + "}}");

		var query = {
			date: {"$gte": date, "$lte": today}
		};

		if(userId) {
			query.userId = userId;
		}

		console.log(query);

		var _this = this;

		var userActivity = new Map();
		var typeActivity = new Map();
		var activeUserList = new Array();

		return new Promise(function(resolve, reject) {
			_this.find(query).exec().then(activities => {
				activities.forEach(activity =>{
					var uid = activity.userId;
					var type = activity.type;
					var xp = activity.exp;

					if(type != "achievement" && type != "reaction" && type != "pinned") {
						if(!activeUserList.includes(uid))
							activeUserList.push(uid);
					}
					//if(type != "achievement") {
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
					//}
				});

				var userActivityTotals = Array();
				var activeUsers = activeUserList.length;

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

				if(isNaN(typeActivity.get("reaction"))) {
					typeActivity.set("reaction", 0);
				}

				if(isNaN(typeActivity.get("message"))) {
					typeActivity.set("message", 0);
				}

				if(isNaN(typeActivity.get("pinned"))) {
					typeActivity.set("pinned", 0);
				}

				if(isNaN(typeActivity.get("trivia"))) {
					typeActivity.set("trivia", 0);
				}

				if(isNaN(typeActivity.get("qotd"))) {
					typeActivity.set("qotd", 0);
				}

				if(isNaN(typeActivity.get("stream"))) {
					typeActivity.set("stream", 0);
				}

				if(isNaN(typeActivity.get("achievement"))) {
					typeActivity.set("achievement", 0);
				}

				if(isNaN(typeActivity.get("holiday_hunter"))) {
					typeActivity.set("holiday_hunter", 0);
				}

				if(isNaN(typeActivity.get("greet"))) {
					typeActivity.set("greet", 0);
				}

				typeActivity.set("total", typeActivity.get("message") + typeActivity.get("voice") +  typeActivity.get("reaction") + 
					typeActivity.get("pinned") + typeActivity.get("event") + typeActivity.get("trivia") + typeActivity.get("qotd") + typeActivity.get("stream") + typeActivity.get("greet")
				);

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

	let ActivityModel = mongoose.model('Activity', activitySchema);

	ActivityModel.upsert = function(doc){
		console.log(doc);
		return ActivityModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};