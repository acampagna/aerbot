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
	const emojiId = "633583934806032387";
	const gameName = "Minecraft";
	const gameWebsite = "https://www.minecraft.net/";

	var gameEmoji = client.emojis.get(emojiId);
	var eventsChannel = client.channels.get("612175461551833129");
	//var refRole = client.roles.get("");


	const embedOne = new Discord.RichEmbed();
	embedOne.setTitle("Game Spotlight - " + gameName);
	embedOne.setColor("GOLD");
	embedOne.setDescription("Explore infinite worlds and build everything from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode, crafting weapons and armor to fend off dangerous mobs. Create, explore and survive alone or with friends on mobile devices, Switch, Xbox One and Windows 10."
	+ "\n\n[Website](" + gameWebsite + ") | [Trailer](https://www.youtube.com/watch?v=gcf9FM4TbN4) | [Starter Guide](https://www.youtube.com/watch?v=e-LpPTnme_M)\n");
	embedOne.addField("Platforms", "All?", true);
	embedOne.addField("Genre", "Open world Sandbox", true);
	embedOne.addField("Players", "Many", true);
	embedOne.addField("Price", "$20-$30", true);
	embedOne.addField("Server", "Come chat in the minecraft channel to join the discussion about us getting a Dauntless private server!");
	embedOne.setFooter("Please be sure to join the " + gameName + " group by clicking the reaction below");
	embedOne.setAuthor(gameName,"https://i.imgur.com/42WV3Lg.jpg", gameWebsite);
	embedOne.setImage("https://i.imgur.com/Ck3rbFt.jpg");

	newMessage = message.channel.send("Today's Game Spotlight is " + gameName + "! If this game sounds interesting to you please click the " + gameEmoji + " reaction below to join the group. Please check out " + eventsChannel + " for " + gameName + " events happening soon!", { embed: embedOne }).then(function (message) {
		message.react(emojiId);
		//message.pin();
	}).catch(function() {
		//Something
	});
} 