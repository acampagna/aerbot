const CoreUtil = require("../utils/Util.js");
const DateDiff = require("date-diff");
const mongoose = require('mongoose');
const { Model, Schema } = mongoose

module.exports = function() {

	const guildSchema = new Schema({
		_id: String,
		officerRoleId: String,
		memberRoleId: String
	});

	guildSchema.methods.updateMemberRoleId = function (id, cb) {
		this.model('Guild').update({id: this.id}, {$set: {memberRoleId: id}}, cb);
	};

	let GuildModel = mongoose.model('Guild', guildSchema);

	GuildModel.upsert = function(doc){
		return GuildModel.findOneAndUpdate(
			{_id: doc._id},
			doc, 
			{upsert: true, new: true, runValidators: true}
		).exec();
	}
};