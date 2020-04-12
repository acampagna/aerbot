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

	const messageQueueItem = new Schema({
		userId: String,
		message: String,
		queueDate: Date,
		sentDate: Date,
		criteria: String,
		sent: {type: Boolean, default: false }
	});

	messageQueueItem.statics.findAll = function() {
		console.log("Finding Queue Items");
		return this.find().exec();
	};

	messageQueueItem.statics.addMessage = function(userId, criteria, message) {
		console.log("Adding Message");
		var date = new Date();
		this.create({userId: userId, message: message, criteria: criteria, queueDate: date});
	};

	messageQueueItem.statics.messageSentRecentlyToUser = async function(userId) {
		console.log("Checking Sent Messages");
		var date = new Date();
        date.setDate( date.getDate() - 7 );
		var numDocs = await this.countDocuments({$and: [{userId: userId},{sentDate : {"$gte": date}} ]});
		console.log("Number Docs = " + numDocs);
		return (numDocs > 0);
	};

	messageQueueItem.statics.getNextMessageForUser = async function(userId) {
		console.log("Getting Next Messages");
		return this.findOne({$and: [{userId: userId},{sent : false} ]}).sort({queueDate: 'asc'}).exec();
	};

	messageQueueItem.statics.getNextMessage = async function() {
		console.log("Getting Next Messages");
		return this.findOne({sent : false}).sort({queueDate: 'asc'}).exec();
	};

	let MessageQueueItem = mongoose.model('MessageQueueItem', messageQueueItem);

	MessageQueueItem.upsert = function(doc){
		console.log(doc);
		return PrizeModel.findOneAndUpdate(
			{_id: doc.id},
			doc, 
			{upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true}
		).exec();
	}
};