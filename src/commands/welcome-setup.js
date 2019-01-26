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
 * @classdesc Sets up the welcome channel, channel permissions, and welcome messages. !welcome-setup runs the entire thing.
 */
function invoke({ message, params, guildData, client }) {
	//Deletes existing channel if an id exists in database
	if(guildData.welcomeChannelId) {
		message.guild.channels.get(guildData.welcomeChannelId).delete();
	}

	let role = message.guild.roles.get(guildData.welcomeRole);

	//Create new Welcome channel then setup initial welcome messages
	message.guild.createChannel(
		"welcome-readme", 
		'text', 
		[{
			id: message.guild.id,
			deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
		}, {
			id: role.id,
			allow: ['VIEW_CHANNEL']
		}]
	).then(channel => {
		//All of this should be made into a command, configuration, or input file of some kind.
		//Message templates should probably be made into their own classes.

		guildData.updateWelcomeChannelId(channel.id);
		const embedOne = new Discord.RichEmbed();
		embedOne.setTitle("Welcome to Dauntless!")
		embedOne.setColor("GOLD");
		embedOne.setDescription("Welcome to Dauntless and the Dauntless discord! Discord is a tool that will allow us to organize and communicate more effectively. Because of this it's very important that everyone checks discord regularly for announcements and events.  Our discord is very basic right now but it will grow over time. \n\nDauntless exists so that all of it's members can have fun and enjoy ROM together as a guild. We are a semi-casual guild which means we want to experience all of the content but we aren't hardcore and don't expect to do it all right away. We will learn together, push each other, and progress at a fun but meaningful pace. There is lots to do and enjoy in ROM and we will strive to enjoy it all together.");
		embedOne.setThumbnail("https://i.imgur.com/6bv1ti2.png");
		channel.send(embedOne);

		const embedTwo = new Discord.RichEmbed();
		embedTwo.setTitle("Get Started with Dauntless!");
		embedTwo.setDescription("There are somethings you need to do as a new member that will help you get catch you up with things going on in Dauntless. Please do the following three steps as soon as you're able to.");
		embedTwo.setColor("RED");
		embedTwo.addField("ONE", "Catch up with the\nlatest \#announcements.", true);
		embedTwo.addField("TWO", "Read all the\ncurrently scheduled \#events.", true);
		embedTwo.addField("THREE", "Introduce yourself\nin the \#introductions\nchannel.", true);
		embedOne.setFooter("This is a welcome channel. You will be removed in 14 days!");
		channel.send(embedTwo);

		const embedThree = new Discord.RichEmbed();
		embedThree.setDescription("**:tickets: Welcome to Dauntless Raffles! :tickets:**\nEvery Sunday for the next 2 weeks there will be 2 raffles for a $15 iTunes or Google Play gift card. Every member on discord that has given an #introductions will be entered into the first raffle automatically each week. There will be a second raffle each week for the top 50% of donation contributors. Members within the top 50% of donation contributors that have given an #introductions will automatically be entered into this second raffle.\n\n**:cop: Looking for @Officer :cop:**\nI am looking for 1-2 officers to help run the guild. This comes with the burden of being partially responsible for the success of Dauntless and the happiness of it's members. As an officer you would be expected to help organize events, promote interaction between guild members, and help lead the guild. If you're interested in being an officer then please private message me on discord.\n\n**:eye: Keep an Eye on Discord :eye:**\nNew #announcements , #events , #guides , and more are posted on Discord everyday. It's important that you check back daily.");
		embedThree.setColor("RED");
		embedThree.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
		channel.send(embedThree);

		const embedFour = new Discord.RichEmbed();
		embedFour.setTitle(":scales: Guild Rules :scales:")
		embedFour.setColor("GOLD");
		embedFour.addField("Rule 1", "All members are expected to Contribute/Donate every day they play ROM. This is necessary for us to grow as a guild and enjoy all the game has to offer us. Please refer to the guides above about donating.");
		embedFour.addField("Rule 2", "All members are strongly encouraged to check discord daily for announcements, events, and other important information.");
		embedFour.addField("Rule 3", "Since we are not a purely casual guild there is an expectation that everyone is active in game. Members that are frequently inactive and/or absent will likely be replaced after a warning.");
		embedFour.addField("Rule 4", "Please to be respectful and tolerant towards one another. That being said, I'm not the word police. Ideally everyone gets along and can poke fun at each other while keeping it civil :)");
		embedFour.addField("Rule 5", "Don't make Dauntless or it's members (including yourself) look bad in public.");
		
		embedFour.setFooter("Note: I'm not a huge fan of too many rules so this list is unlikely to grow");
		channel.send(embedFour);

		/*const embedFour = new Discord.RichEmbed();
		embedFour.setTitle("Bot Help");
		embedFour.setDescription("Sed nec ultrices quam, eu commodo ex. Curabitur euismod vestibulum urna at efficitur. In a enim ex. Praesent cursus elit et nisl ullamcorper aliquam. Nulla risus lectus, dapibus consequat sollicitudin eu, aliquet ac ante. Aenean at elit sit amet lectus fringilla porttitor. Cras porttitor vitae dolor non dignissim. Morbi egestas lacus vel ligula placerat sagittis. Aenean pellentesque mauris nisl, vulputate cursus lectus dapibus at...");
		embedFour.setColor("RED");
		embedFour.setURL("http://www.dauntlessgc.com");
		channel.send(embedFour);

		const embedFive = new Discord.RichEmbed();
		embedFive.setColor("AQUA");
		embedFive.setImage("https://www.theartroom.org.uk/sites/www.theartroom.org.uk/files/styles/object_listing_image/public/2016-11/Welcome-nobackground.png?itok=JhcDYqx3");
		channel.send(embedFive);*/

	}).catch(console.error);
	return Promise.resolve("Setting up welcome channel!");
}
