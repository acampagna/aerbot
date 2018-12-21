const CoreUtil = require("../utils/Util.js");
var GphApiClient = require('giphy-js-sdk-core');
const Command = require("../Command.js");
const gifClient = GphApiClient("j03gdWqzVJOQMfAAEMPmCWScR66o7QtP");

module.exports = new Command({
	name: "gif",
	description: "Posts a random gif",
	syntax: "gif keyword",
	admin: false,
	invoke
});

function invoke({ message, params, guildData, client }) {
	return new Promise(function(resolve, reject) {
		gifClient.random('gifs', {"tag": params[0]})
         .then((response) => {
			var gif = response.data[0].url;
		   resolve(gif);
         })
         .catch((err) => {
			CoreUtil.dateLog("ERR: " + err);
		 })
	});
}