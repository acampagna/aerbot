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
async function invoke({ message, params, serverData, client }) {
	//Deletes existing channel if an id exists in database

	var channel;
	var role = message.guild.roles.get(serverData.welcomeRole);

	if(serverData.welcomeChannelId) {
		channel = message.guild.channels.get(serverData.welcomeChannelId);
	} else {
		channel = message.guild.createChannel(
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
		)
	}

	//All of this should be made into a command, configuration, or input file of some kind.
	//Message templates should probably be made into their own classes.

	var refChan = client.channels.get("630898414074331136");
	var eventsChan = client.channels.get("612175461551833129");
	var introChan = client.channels.get("579759668218298398");
	var annChan = client.channels.get("620032094009294858");
	var rulesChan = client.channels.get("632667753936977921");

	serverData.updateWelcomeChannelId(channel.id);
	const embedOne = new Discord.RichEmbed();
	embedOne.setTitle("Welcome to Dauntless!")
	embedOne.setColor("GOLD");
	embedOne.setDescription("Welcome to Dauntless Gaming Community! Dauntless is a multi-game & multi-platform gaming community. Our goal is to create "
	+ "a fun gaming community for all our members.\n\nWe are just getting started and hope to start "
	+ "growing more rapidly. Please keep up with discord for the latest " + annChan + ".\n\n"
	+ "[Twitter](https://twitter.com/dauntlessgc) | [Facebook](https://www.facebook.com/Dauntless-Gaming-Community-105069480897689) | [Patreon](https://www.patreon.com/dauntlessGC)");
	embedOne.setThumbnail("https://i.imgur.com/6bv1ti2.png");
	channel.send(embedOne);

	const embedTwo = new Discord.RichEmbed();
	embedTwo.setTitle("Get Started with Dauntless!");
	embedTwo.setDescription("There are somethings you sould to do as a new member that will help you get quickly integrated into the  Dauntless Gaming Community (DGC). "
	+ "Please do the following three steps as soon as you're able to.");
	embedTwo.setColor("RED");
	embedTwo.addField("ONE", "Add yourself to\nsome groups\nbelow.", true);
	embedTwo.addField("TWO", "Read all the\ncurrently scheduled \n" + eventsChan + ".", true);
	embedTwo.addField("THREE", "Introduce yourself\nin the " + introChan + "\nchannel.", true);
	//embedOne.setFooter("This is a welcome channel. You will be removed in 14 days!");
	channel.send(embedTwo);

	//Super proud of this part. "embedThree1"...lol
	const embedThree1 = new Discord.RichEmbed();
	embedThree1.setDescription("**:tickets: Recruit your Friends:tickets:**\nIf you enjoy your first few hours/days in Dauntless then please consider recruiting your friends. Everyone wins when we all get our friends gaming in one place!")
	embedThree1.setColor("GOLD");
	channel.send(embedThree1);
	

	/*const embedThree3 = new Discord.RichEmbed();
	embedThree3.setDescription("**:sparkles: Discord Tips :sparkles:**\n"
	+ "1. Mute channels that are too noisy");
	embedThree3.setColor("RANDOM");
	embedThree3.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
	channel.send(embedThree3);*/

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

	const embedFour = new Discord.RichEmbed();
	embedFour.setTitle(":scales: Guild Rules :scales:")
	embedFour.setColor("RED");
	/*embedFour.addField("Rule 1", "All members are expected to Contribute/Donate every day they play ROM. This is necessary for us to grow as a guild and enjoy all the game has to offer us. Please refer to the guides above about donating.");
	embedFour.addField("Rule 2", "All members are strongly encouraged to check discord daily for announcements, events, and other important information.");
	embedFour.addField("Rule 3", "Since we are not a purely casual guild there is an expectation that everyone is active in game. Members that are frequently inactive and/or absent will likely be replaced after a warning.");
	embedFour.addField("Rule 4", "Please to be respectful and tolerant towards one another. That being said, I'm not the word police. Ideally everyone gets along and can poke fun at each other while keeping it civil :)");
	embedFour.addField("Rule 5", "Don't make Dauntless or it's members (including yourself) look bad in public.");
	embedFour.setFooter("Note: I'm not a huge fan of too many rules so this list is unlikely to grow");*/
	embedFour.setDescription("All members are expected to read and follow all community " + rulesChan + ".");
	channel.send(embedFour);

	const embedDonations = new Discord.RichEmbed();
	embedDonations.setTitle(":moneybag: Donations :moneybag:")
	embedDonations.setColor("GOLD");
	embedDonations.setDescription("Our staff & Contributors spend $150-200 a month to keep Dauntless alive, fun, and growing. If you love this community and are able to help with it's costs then "
	+ "please consider donating via [Patreon](https://www.patreon.com/dauntlessGC) or our [PayPal](https://www.paypal.com/pools/c/8jEjInSNmQ).\n\n"
	+ "Your money will be put towards Server fees for Aerbot, Advertising and Marketing fees, and Giveaways, Contests, and Raffles.\n\n")
	embedDonations.setFooter("Thank you so much to all of our Contributors! You help make Dauntless posttible and we could never thank you all enough");
	
	channel.send(embedDonations);

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

	return Promise.resolve("Setting up welcome channel!");
}
