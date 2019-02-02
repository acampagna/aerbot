const CoreUtil = require("../utils/Util.js");
var GphApiClient = require('giphy-js-sdk-core');
const Command = require("../Command.js");
//Shouldn't put this in the code but it doesn't work anyway so who cares.
const gifClient = GphApiClient("j03gdWqzVJOQMfAAEMPmCWScR66o7QtP");

module.exports = new Command({
	name: "gif",
	description: "Posts a random gif",
	syntax: "gif keyword",
	admin: false,
	invoke
});

/**
 * Pulls a gif from giphy based on a search term.
 * FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	return new Promise(function(resolve, reject) {
		gifClient.random('gifs', {"tag": params[0]})
         .then((response) => {
			var gif = response.data.url;
		   resolve(gif);
         })
         .catch((err) => {
			CoreUtil.dateLog("ERR: " + err);
		 })
	});
}