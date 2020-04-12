const CoreUtil = require("../utils/Util.js");
const Validation = require("../utils/ValidationUtil.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const MessageQueueItem = mongoose.model('MessageQueueItem');
const Discord = require("discord.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const MessageQueueService = require("../services/MessageQueueService");
const MemberFetchingService = require("../services/MemberFetchingService");

const MFS = new MemberFetchingService();
const MSQ = new MessageQueueService();

module.exports = new Command({
	name: "send",
	description: "Queue up a message to send",
	syntax: "send",
	admin: true,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	var paramStr = params.join(" ");
	var newParams = paramStr.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
	}, {a: ['']}).a
	
	console.log(newParams);
	console.log(newParams[0]);
	
	/*if(message.mentions.users.first()) {
		var memberId = message.mentions.users.first().id;
	} else */
	
	/*if(params[0]){
		var memberId = params[0];
	} else {
		return Promise.resolve("You must specify a user ID to send a message to!");
	}*/

	return new Promise(async function(resolve, reject) {
		if(CoreUtil.isMemberAerfalle(message.member)) {
			/*console.log(params);
			params.shift();
			console.log(params);*/

			/* if(params.join(" ") == "") {
				var response = await MSQ.sendNextMessageTo(memberId, params.join(" "));
				console.log("Response: " + response);
				if(response) {
					resolve("Message sent!");
				} else {
					resolve("Message not sent! Message not found or user either received a message recently or has unsubscribed!");
				}
			} else {
				var response = await MSQ.addMessage(memberId, params.join(" "));
				//var recentMessage = await MessageQueueItem.messageSentRecentlyToUser(memberId);
				//console.log(recentMessage);
				if(response) {
					resolve("Message added to queue");
				} else {
					resolve("Message not added to queue. User either received a message recently or has unsubscribed!");
				}
			} */

			var role = message.guild.roles.get("536619177994092549");
			var listSwitchMembers = MFS.getMembersInRole(role);
			//id
			var listInactive = await MFS.getInactiveMembers();
			//_id
			var results = new Array();
			
			listSwitchMembers.forEach(m => {
				const result = listInactive.find( ({ _id }) => _id === m.id );
				if(result) {
					results.push(result._id);
				} else {
					if(m.username) {
						console.log(m.username + " is active");
					} else {
						console.log(m.id + " is active");
					}
				}
			});

			console.log(results.length);

			/*await MSQ.addMessage("151473524974813184", params.join(" "));
			await MSQ.addMessage("388822941728636938", params.join(" "));
			await MSQ.addMessage("623510790149898240", params.join(" "));
			await MSQ.addMessage("618249176915902464", params.join(" "));
			await MSQ.addMessage("570442148072390656", params.join(" "));
			await MSQ.addMessage("653459934901567517", params.join(" "));
			await MSQ.addMessage("298472961373896714", params.join(" "));
			await MSQ.addMessage("155778364014067712", params.join(" "));*/
			
			CoreUtil.asyncForEach(results, async (r) => {
				await MSQ.addMessage(r, params.join(" "));
			});

			resolve("YES");
		} else {
			resolve("Only Aerfalle can use this command!");
		}
	});
}