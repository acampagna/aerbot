const mongoose = require('mongoose');
const { Model, Schema } = mongoose

/**
 * Defines a user database model. 
 * I'm not totally sure about how to be using mongoose. As with everything in Javascript it seems very open-ended and sucks.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
module.exports = function() {

	const userSchema = new Schema({
		_id: String,
		guildId: String,
		username: String,
		level: { type: Number, default: 1, min: 1, max: 999 },
		exp: { type: Number, default: 0, min: 0},
		expAdjustment: { type: Number, default: 0 },
		currency: { type: Number, default: 0, min: 0},
		rank: { type: String, default: "Padawan" },
		class: { type: String, default: "Padawan" },
		title: { type: String, default: "Noobling" },
		messages: { type: Number, default: 0, min: 0 },
		events: { type: Number, default: 0, min: 0 },
		voiceActivity: { type: Number, default: 0, min: 0 },
		triviaCorrect: { type: Number, default: 0, min: 0 },
		triviaWon: { type: Number, default: 0, min: 0 },
		reactions: { type: Number, default: 0, min: 0 },
		pinned: { type: Number, default: 0, min: 0 },
		activityPoints: { type: Number, default: 0, min: 0 },
		lastOnline: {type: Date, default: new Date()},
		lastActive: {type: Date, default: new Date()},
		joined: {type: Date, default: new Date()},
		accounts: { type: Map, of: String },
		referrer: String,
		gachaWins: {type: Number, default: 0},
		brWins: {type: Number, default: 0},
		achievements: { type: Array, of: String },
		badges: { type: Map, of: Number },
		levelRole: String,
		embedColor: {type: String, default: "DEFAULT"},
		counts: {type: Map, of: Number},
		active: { type: Boolean, default: true },
		left: Date,
		unsubscribed: { type: Boolean, default: false },
		latestGames: { type: Array, of: String },
		latestEvents: { type: Array, of: String },
		referrerCredited: {type: Boolean, default: false}
	});

	userSchema.methods.getAccounts = function () {
		return this.accounts || new Map();
	};

	userSchema.methods.getCounts = function () {
		if(!this.counts) {
			this.counts = new Map();
		}

		return this.counts;
	};

	userSchema.methods.getCount = function (k) {
		var counts = this.getCounts();
		if(counts.has(k)) {
			return counts.get(k);
		} else {
			return 0;
		}
	};

	userSchema.methods.incCount = function (k) {
		console.log("INC COUNT");
		if(this.getCounts().has(k)) {
			console.log("+1");
			this.counts.set(k,this.counts.get(k)+1);
		} else {
			console.log("1");
			this.counts.set(k,1);
		}
		console.log(this.getCounts());
	};

	userSchema.methods.setCount = function (k, v) {
		this.getCounts().set(k,v);
	};

	userSchema.methods.getBadges = function () {
		return this.badges || new Map();
	};

	userSchema.methods.getAchievements = function () {
		return this.achievements || new Array();
	};

	userSchema.methods.updateReferrer = function (referrerId) {
		this.model('User').updateOne({_id: this.id},{referrer: referrerId}).exec();
	};

	userSchema.methods.unsubscribe = function () {
		console.log("Unsubscribing!");
		this.model('User').updateOne({_id: this.id},{unsubscribed: true}).exec();
	};

	userSchema.methods.subscribe = function () {
		console.log("Subscribing!");
		this.model('User').updateOne({_id: this.id},{unsubscribed: false}).exec();
	};

	userSchema.methods.addLatestGame = function (gameName) {
		var latestGames = this.latestGames || new Array();
		//console.log(latestGames);
		if(!latestGames.includes(gameName)){
			//console.log("List doesn't include " + gameName);
			latestGames.unshift(gameName);
			if(latestGames.length > 3) {
				//console.log("Popped last game");
				latestGames.pop();
			}
			this.model('User').updateOne({_id: this.id},{latestGames: latestGames}).exec();
		}
	};

	userSchema.methods.addLatestEvent = function (gameName) {
		var latestEvents = this.latestEvents || new Array();
		//console.log(latestEvents);
		if(!latestEvents.includes(gameName)){
			//console.log("List doesn't include " + gameName);
			latestEvents.unshift(gameName);
			if(latestEvents.length > 10) {
				//console.log("Popped last game");
				latestEvents.pop();
			}
			this.model('User').updateOne({_id: this.id},{latestEvents: latestEvents}).exec();
		}
	};

	userSchema.methods.addAchievement = function (id) {
		return this.model('User').findOneAndUpdate(
			{_id: this.id},
			{$addToSet: {achievements: id}},
			{new: true}).exec();
	}

	userSchema.methods.removeAchievement = function (id) {
		return this.model('User').findOneAndUpdate(
			{_id: this.id},
			{$pull: {achievements: id}},
			{new: true}).exec();
	}

	userSchema.statics.findAllUsers = function() {
		return this.find().exec();
	};

	userSchema.statics.findAllUsersWithAccounts = function() {
		console.log("Find all users with accounts");
		return this.find({ accounts: { $exists: true } }).exec();
	};

	userSchema.statics.findAllActiveUsersWithAccounts = function() {
		var date = new Date();
        date.setDate( date.getDate() - 15 );
		console.log("Find all users with accounts");
		return this.find({"$and": [{ accounts: { $exists: true }}, {lastActive : {"$gte": date}}]}).exec();
	};

	userSchema.statics.countReferals = function(id) {
		return this.countDocuments({referrer: id}).exec();
	};

	// TODO: Either replace all instances of User.findById with this function, or remove this function
	userSchema.statics.byId = function(id) {
		id = id.toString().replace(/\D/g,'');
		return this.findById(id).exec();
	};

	userSchema.statics.findInIds = function(ids) {
		return this.find({_id: {$in:ids} }).exec();
	}

	userSchema.statics.findActiveSince = function(date) {
		console.log("{\"lastActive\" : {\"$gte\": " + date + "}}");
		return this.find({"$and": [{ left: { $exists: false }}, {lastActive : {"$gte": date}}]}).exec();
	}

	userSchema.statics.findInactiveSince = function(date) {
		console.log("{\"lastActive\" : {\"$lte\": " + date + "}}");
		return this.find({"$and": [{ left: { $exists: false }}, {lastActive : {"$lte": date}}]}).exec();
	}

	userSchema.statics.byUsername = function(username) {
		return this.findOne({ username: new RegExp(`^${username}$`, 'i') }).exec();
	};

	userSchema.statics.byCharacter = function(name) {
		return this.findOne({ characters: new RegExp(`^${name}$`, 'i') }).exec();
	}

	userSchema.statics.findAllUsersAboveLevel = function(level) {
		return this.find({"$and": [{ accounts: { $exists: true }}, { level: { "gt": level }}]}).exec();
	};

	userSchema.statics.findAllUsersBelowLevel = function(level) {
		return this.find({"$and": [{ accounts: { $exists: true }}, { level: { "lt": level }}]}).exec();
	};

	userSchema.statics.findUsersReferrals = function(uid) {
		console.log("Finding referrals for " + uid);
		return this.find({referrer: uid, level: {"$gte": 5}}).exec();
	};

	let UserModel = mongoose.model('User', userSchema);

	UserModel.upsert = function(doc){
		console.log(doc);
		return UserModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};