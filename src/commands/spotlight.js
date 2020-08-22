const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
//const User = mongoose.model('Spotlight');
const Discord = require("discord.js");

module.exports = new Command({
	name: "spotlight",
	description: "Currently just sends spotlight message",
	syntax: "spotlight",
	admin: true,
	invoke
});

/**
 * Sets and displays accounts for a member. Currently we use a single default for setting and displaying.
 * UNFINISHED. NEEDS CLEANUP. NEEDS TO BE FINISHED.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	const emojiId = "724655607285547463";
	const gameName = "Path of Exile - Harvest League";
	const gameDesc = "Path of Exile is a free-to-play action role-playing video game developed and published by Grinding Gear Games. The June expansion contains the Harvest challenge league, in game [crop] farming, powerful new crafting options, eight new skills, two new support gems, revamps of Two-handed Weapons, Warcry skills, Brands, Slams and the Passive Skill Tree itself."
	const gameWebsite = "https://www.pathofexile.com/";
	const gameTrailer = "https://www.youtube.com/watch?v=Tv12xh498ms";
	const gameBeginnerGuide = "https://www.youtube.com/watch?v=p2fMTuncGLI";
	const gamePlatforms = "PC, Xbox One, PS4";
	const gameGenre = "Dungeon Crawler";
	const gameSimilarTo = "Diablo";
	const gameIconImage = "https://i.imgur.com/Eo4ha.png";
	const gameScreenshot = "https://steamuserimages-a.akamaihd.net/ugc/769476940221659778/5DD066527D21DC30A7984DB9E774A33319302DD7/";
	const gameChannelTag = "#path-of-exile"

	var gameEmoji = client.emojis.get(emojiId);
	var eventsChannel = client.channels.get("641521814979346452");
	//var refRole = client.roles.get("");


	const embedOne = new Discord.RichEmbed();

	embedOne.setTitle("Game Spotlight: " + gameName);
	embedOne.setColor("GOLD");
	embedOne.setDescription(gameDesc + "\n\n[Website](" + gameWebsite + ")  |  [Trailer]("+gameTrailer+")  |  [Beginners Guide]("+gameBeginnerGuide+")\n");
	embedOne.addField("Platforms", gamePlatforms, true);
	embedOne.addField("Genre", gameGenre, true);
	//embedOne.addField("Players", "2-8", true);
	embedOne.addField("Similar to", gameSimilarTo, true);
	embedOne.addField("Price", "Free", true);
	//embedOne.addField("Crossplay", "Players on PC, Xbox One, PS4, and Switch can all play together!");
	embedOne.setFooter("Please be sure to join the " + gameName + " group by clicking the " + gameName + " reaction below");
	embedOne.setAuthor(gameName, gameIconImage, gameWebsite);
	embedOne.setImage(gameScreenshot);

	newMessage = message.channel.send("Today's Game Spotlight is " + gameChannelTag + "! If this game sounds interesting to you please click the " + gameEmoji + " reaction below to join the group.", { embed: embedOne }).then(function (message) {
		message.react(emojiId);
		//message.pin();
	}).catch(function() {
		//Something
	});
} 