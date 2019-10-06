const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const Discord = require("discord.js");

module.exports = new Command({
	name: "welcome-setup",
	description: "Sets up the welcome channel",
	syntax: "welcome-setup",
	admin: true,
	invoke
});

/**
 * Sets up the welcome channel, channel permissions, and welcome messages. !welcome-setup runs the entire thing.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	//Deletes existing channel if an id exists in database
	if(serverData.welcomeChannelId) {
		//message.guild.channels.get(serverData.welcomeChannelId).delete();
	}

	let role = message.guild.roles.get(serverData.welcomeRole);

	//Create new Welcome channel then setup initial welcome messages
	message.guild.createChannel(
		"welcome-readme", 
		'text', 
		[{
			id: message.guild.id,
			deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
			allow: ['READ_MESSAGE_HISTORY']
		},{
			id: role.id,
			allow: ['VIEW_CHANNEL']
		}]
	).then(channel => {
		//All of this should be made into a command, configuration, or input file of some kind.
		//Message templates should probably be made into their own classes.

		serverData.updateWelcomeChannelId(channel.id);
		const embedOne = new Discord.RichEmbed();
		embedOne.setTitle("Welcome to Dauntless!")
		embedOne.setColor("GOLD");
		embedOne.setDescription("Welcome to Dauntless and the Dauntless Gaming Community discord! Dauntless is a multi-game & multi-platform gaming community. Our goal is to create "
		+ "a large, functional, and fun gaming community for all gamers no matter your platform, culture, gender, region, etc.\n\nWe are just getting started and hope to start "
		+ "growing more rapidly. Please keep up with discord for the latest games, announcements, events, etc.\n\nThe most important step is to add yourself to some game and "
		+ "platform groups. See below for more details on groups.");
		embedOne.setThumbnail("https://i.imgur.com/6bv1ti2.png");
		channel.send(embedOne);

		const embedTwo = new Discord.RichEmbed();
		embedTwo.setTitle("Get Started with Dauntless!");
		embedTwo.setDescription("There are somethings you sould to do as a new member that will help you get catch you up with things going on in Dauntless. "
		+ "Please do the following three steps as soon as you're able to.");
		embedTwo.setColor("RANDOM");
		embedTwo.addField("ONE", "Add yourself to\nsome groups.", true);
		embedTwo.addField("TWO", "Read all the\ncurrently scheduled \#events.", true);
		embedTwo.addField("THREE", "Introduce yourself\nin the \#introductions\nchannel.", true);
		embedOne.setFooter("This is a welcome channel. You will be removed in 14 days!");
		channel.send(embedTwo);

		//Super proud of this part. "embedThree1"...lol
		const embedThree1 = new Discord.RichEmbed();
		embedThree1.setDescription("**:tickets: Recruit your Friends :tickets:**\nDauntless will be better and more vibrant if we all invite our friends to join in on our gaming "
		+ "fun. Please consider inviting your friends to this Discord.\nhttp://www.discord.gg/JtWe5ND")
		embedThree1.setColor("RANDOM");
		embedThree1.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
		channel.send(embedThree1);

		const embedThree3 = new Discord.RichEmbed();
		embedThree3.setDescription("**:sparkles: Discord Tips :sparkles:**\n"
		+ "1. Mute channels that are too noisy");
		embedThree3.setColor("RANDOM");
		embedThree3.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
		channel.send(embedThree3);

		//https://www.discoverdiscord.com/blog/discord-notifications-under-control
		//:sparkles: 

		//Super proud of this part. "embedThree2"...lol
		/*const embedThree2 = new Discord.RichEmbed();
		embedThree2.setDescription("**:cop: Looking for @Officer :cop:**\nI am looking for 1-2 officers to help run the guild. This comes with the burden of being partially responsible for the success of Dauntless and the happiness of it's members. As an officer you would be expected to help organize events, promote interaction between guild members, and help lead the guild. If you're interested in being an officer then please private message me on discord.")
		embedThree2.setColor("RED");
		embedThree2.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
		channel.send(embedThree2);*/

		//Super proud of this part. "embedThree3"...lol
		/*const embedThree3 = new Discord.RichEmbed();
		embedThree3.setDescription("**:eye: Keep an Eye on Discord :eye:**\nNew #announcements , #events , #guides , and more are posted on Discord everyday. It's important that you check back daily.");
		embedThree3.setColor("RED");
		embedThree3.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
		channel.send(embedThree3);*/

		/*const embedFour = new Discord.RichEmbed();
		embedFour.setTitle(":scales: Guild Rules :scales:")
		embedFour.setColor("GOLD");
		embedFour.addField("Rule 1", "All members are expected to Contribute/Donate every day they play ROM. This is necessary for us to grow as a guild and enjoy all the game has to offer us. Please refer to the guides above about donating.");
		embedFour.addField("Rule 2", "All members are strongly encouraged to check discord daily for announcements, events, and other important information.");
		embedFour.addField("Rule 3", "Since we are not a purely casual guild there is an expectation that everyone is active in game. Members that are frequently inactive and/or absent will likely be replaced after a warning.");
		embedFour.addField("Rule 4", "Please to be respectful and tolerant towards one another. That being said, I'm not the word police. Ideally everyone gets along and can poke fun at each other while keeping it civil :)");
		embedFour.addField("Rule 5", "Don't make Dauntless or it's members (including yourself) look bad in public.");
		embedFour.setFooter("Note: I'm not a huge fan of too many rules so this list is unlikely to grow");
		channel.send(embedFour);*/

		//Guides disabled because it ends up sending at the top of the channel. Probably need to use promises to enforce the order of messages.
		/*let guides = "";
		guides += "Why Join a Guild?: <https://www.reddit.com/r/RagnarokMobile/comments/a3f0la/what_is_guild_for/>\n";
		guides += "All About Guilds: <https://www.youtube.com/watch?v=id0Ul2cmxtw>\n";
		guides += "Zenny Farming Guide: <https://ragnamobileguide.com/zeny-farming-spots-ragnarok-mobile-eternal-love/>\n";
		guides += "Rune System (Aesir Monument): <https://ragnamobileguide.com/guide-to-rune-system-ragnarok-mobile-eternal-love/>\n";
		guides += "Guild Facilities: <https://rierin.com/2018/01/05/guild-facility/>\n"
		guides += "Where to buy Peak Shards: <https://gamingph.com/2018/11/where-to-buy-peak-shard-in-ragnarok-m-eternal-love/>\n";
		guides += "Valhalla Ruins: <https://www.google.com/amp/s/amp.reddit.com/r/RagnarokMobile/comments/9x0vv7/comprehensive_faq_for_valhalla_ruinsguild_raid/>\n"
		channel.send(guides);*/

		//Keep for template ideas
		/*const embedFour = new Discord.RichEmbed();
		embedFour.setTitle("Bot Help");
		embedFour.setDescription("Sed nec ultrices quam, eu commodo ex. Curabitur euismod vestibulum urna at efficitur. In a enim ex. Praesent cursus elit et nisl ullamcorper aliquam. Nulla risus lectus, dapibus consequat sollicitudin eu, aliquet ac ante. Aenean at elit sit amet lectus fringilla porttitor. Cras porttitor vitae dolor non dignissim. Morbi egestas lacus vel ligula placerat sagittis. Aenean pellentesque mauris nisl, vulputate cursus lectus dapibus at...");
		embedFour.setColor("RED");
		embedFour.setURL("http://www.dauntlessgc.com");
		channel.send(embedFour);
		//Keep for template ideas
		const embedFive = new Discord.RichEmbed();
		embedFive.setColor("AQUA");
		embedFive.setImage("https://www.theartroom.org.uk/sites/www.theartroom.org.uk/files/styles/object_listing_image/public/2016-11/Welcome-nobackground.png?itok=JhcDYqx3");
		channel.send(embedFive);*/

	}).catch(console.error);
	return Promise.resolve("Setting up welcome channel!");
}
