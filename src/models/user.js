const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
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
		level: { type: Number, default: 1, min: 1, max: 99 },
		exp: { type: Number, default: 0, min: 0},
		currency: { type: Number, default: 0, min: 0},
		rank: { type: String, default: "Padawan" },
		class: { type: String, default: "Padawan" },
		messages: { type: Number, default: 0, min: 0 },
		reactions: { type: Number, default: 0, min: 0 },
		praise: { type: Number, default: 0, min: 0 },
		activityPoints: { type: Number, default: 0, min: 0 },
		lastMessage: Date,
		lastReaction: Date,
		lastOnline: {type: Date, default: new Date()},
		lastActive: {type: Date, default: new Date()},
		joined: {type: Date, default: new Date()},
		accounts: { type: Map, of: String },
		referrer: String
	});

	userSchema.methods.getAccounts = function () {
		return this.accounts || new Map();
	};

	userSchema.methods.updateReferrer = function (referrerId) {
		this.model('User').updateOne({_id: this.id},{referrer: referrerId}).exec();
	};

	userSchema.statics.findAllUsers = function() {
		return this.find().exec();
	};

	userSchema.query.byUsername = function(username) {
		return this.where({ username: new RegExp(username, 'i') });
	};

	userSchema.query.byId = function(id) {
		return this.where({ _id: id });
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