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
	const emojiId = "682887070003494923";
	const gameName = "Paladins";
	const gameWebsite = "https://www.paladins.com/";

	var gameEmoji = client.emojis.get(emojiId);
	var eventsChannel = client.channels.get("641521814979346452");
	//var refRole = client.roles.get("");


	const embedOne = new Discord.RichEmbed();
	/*embedOne.setTitle("Game Spotlight - " + gameName);
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
	embedOne.setImage("https://i.imgur.com/Ck3rbFt.jpg");*/

	/*embedOne.setTitle("Game Spotlight - " + gameName);
	embedOne.setColor("GOLD");
	embedOne.setDescription("Brawlhalla is a free-to-play fighting game similar to Smash Bros that was built from the ground up with online multiplayer in mind. In most of Brawlhalla's game modes, the goal is to knock one's opponent off the stage. There are over 40 legends available in this free, fast-paced, and fun fighting game!"
	+ "\n\n[Website](" + gameWebsite + ")  |  [Trailer](https://www.youtube.com/watch?v=baixpNzE9es)  |  [Beginners Guide](https://www.youtube.com/watch?v=c_jxRai9u9A)  |  [Legends Guide](https://www.youtube.com/watch?v=M6uWi_luLqY)\n");
	embedOne.addField("Platforms", "PC, Xbox One,\nPS4, Switch", true);
	embedOne.addField("Genre", "Fighting Game", true);
	embedOne.addField("Players", "2-8", true);
	embedOne.addField("Similar to", "Super Smash Bros", true);
	embedOne.addField("Price", "Free", true);
	embedOne.addField("Rating", "[89%](https://store.steampowered.com/app/291550/Brawlhalla/)", true);
	embedOne.addField("Crossplay", "Players on PC, Xbox One, PS4, and Switch can all play together!");
	embedOne.setFooter("Please be sure to join the " + gameName + " group by clicking the reaction below");
	embedOne.setAuthor(gameName,"https://i.imgur.com/Hd8emyc.png", gameWebsite);
	embedOne.setImage("https://i.imgur.com/f0HGcrR.jpg");*/

	embedOne.setTitle("Game Spotlight - " + gameName);
	embedOne.setColor("GOLD");
	embedOne.setDescription("Paladins: Champions of the Realm is a free-to-play online Hero shooter video game by Hi-Rez Studios. The game was developed by Evil Mojo Games, an internal studio of Hi-Rez, and was released in 2016 for Microsoft Windows, PlayStation 4, Xbox One, and Nintendo Switch."
	+ "\n\n[Website](" + gameWebsite + ")  |  [Trailer](https://www.youtube.com/watch?v=0rV3-HXhky8)  |  [Beginners Guide](https://www.youtube.com/watch?v=PmkVd_Lls30)\n");
	embedOne.addField("Platforms", "PC, Xbox One, PS4, Switch", true);
	embedOne.addField("Genre", "FPS", true);
	//embedOne.addField("Players", "2-8", true);
	embedOne.addField("Similar to", "Overwatch", true);
	embedOne.addField("Price", "Free", true);
	embedOne.addField("Crossplay", "Players on PC, Xbox One, PS4, and Switch can all play together!");
	embedOne.setFooter("Please be sure to join the " + gameName + " group by clicking the Paladins reaction below");
	embedOne.setAuthor(gameName,"https://i.imgur.com/zAstMSO.png", gameWebsite);
	embedOne.setImage("https://i.imgur.com/MnV3mkZ.jpg");

	newMessage = message.channel.send("Today's Game Spotlight is " + gameName + "! If this game sounds interesting to you please click the " + gameEmoji + " reaction below to join the group. Please check out " + eventsChannel + " for " + gameName + " events happening soon!", { embed: embedOne }).then(function (message) {
		message.react(emojiId);
		//message.pin();
	}).catch(function() {
		//Something
	});
} 