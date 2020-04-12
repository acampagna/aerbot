/**
 * Discord utilities. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
const CoreUtil = require("./Util.js");
const DidYouKnow = require("../didYouKnow.json");
const MemberUtil = require("./MemberUtil.js");

function getMember(id, obj) {
	CoreUtil.dateLog(`Adding ${calculateActionExp(action)} exp`);
	return currentExp + calculateActionExp(action);
}

function processEmbed(embed, client) {
	if(embed.footer === undefined) {
		embed.setFooter
		embed.setFooter("Did you know?: " + getRandomDYK(client), "https://i.imgur.com/aHlkUNJ.png");
	}

	return embed;
}

function getRandomDYK(client) {
	let rnd = Math.floor(Math.random()*DidYouKnow.dyks.length);
	var str = DidYouKnow.dyks[rnd];

	if(str.includes("{$welcomeChannel}")) {
		var welcomeChan = client.channels.get("630942808093622273");
		str = str.split("{$welcomeChannel}").join(welcomeChan);
	}

	if(str.includes("{$eventsChannel}")) {
		var eventChan = client.channels.get("641521814979346452");
		str = str.split("{$eventsChannel}").join(eventChan);
	}
	
	return str;
}

function doesMessageContainEmoji(message) {

}

function doesMessageContainUpload(message) {

}

function doesMessageContainLink(message) {

}

function constructTableFromMap(map) {
	var longestKey = 0;
	map.forEach(function(value, key) {
		if(key.length > longestKey)
			longestKey = key.length;
	});

	var retStr = "";

	map.forEach(function(value, key) {
		var newValue = value;

		if(MemberUtil.validURL(value)) {
			newValue = "<" + value + ">";
		}

		retStr != "" ? retStr += "\n" : retStr += "";
		retStr += "` " + key + " ".repeat(longestKey - key.length) + "  ` " + newValue; 
	});

	return retStr;
}

module.exports = {
	getMember,
	processEmbed,
	constructTableFromMap
};