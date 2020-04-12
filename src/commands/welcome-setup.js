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
		//channel = message.guild.channels.get(serverData.welcomeChannelId);
		channel = message.guild.channels.get("667569600401244172");
	} else {
		/*channel = message.guild.createChannel(
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
		)*/
	}
	//All of this should be made into a command, configuration, or input file of some kind.
	//Message templates should probably be made into their own classes.

	var refChan = client.channels.get("630898414074331136");
	var eventsChan = client.channels.get("641521814979346452");
	var introChan = client.channels.get("579759668218298398");
	var annChan = client.channels.get("620032094009294858");
	var rulesChan = client.channels.get("632667753936977921");
	var rolesChan = client.channels.get("629371012986961921");
	var giveawaysChan = client.channels.get("640620860914270276");
	var pokemonEmoji = client.emojis.get("643192135797178369");
	var gamesiesChan = client.channels.get("642979603652018179");

	var contentCreatorRole = message.guild.roles.get("629419587712057344");
	var explicitContentRole = message.guild.roles.get("625571607246536734");
	var announcementsRole = message.guild.roles.get("640571967312756786");
	var eventsRole = message.guild.roles.get("640572016881303562");
	var streamAlertsRole = message.guild.roles.get("659812711407943707");

	serverData.updateWelcomeChannelId(channel.id);
	const embedOne = new Discord.RichEmbed();
	embedOne.setTitle("Welcome to DGC!")
	embedOne.setColor("RED");
	embedOne.setDescription("Welcome to Dauntless Gaming Community! DGC is a multi-game & multi-platform gaming community. Our goal is to create "
	+ "a fun gaming community for all our members. Make sure you keep up with the latest " + annChan);
	embedOne.setThumbnail("https://i.imgur.com/6bv1ti2.png");
	channel.send(embedOne);

	const embedTwo = new Discord.RichEmbed();
	embedTwo.setTitle("Get Started with DGC!");
	embedTwo.setDescription("There are somethings you sould to do as a new member that will help you get quickly integrated into the Dauntless Gaming Community (DGC). "
	+ "Please do the following six steps as soon as you're able to.");
	embedTwo.setColor("GOLD");
	embedTwo.addField("ONE", "Add yourself to\nsome groups\nbelow", true);
	embedTwo.addField("TWO", "Read all the\ncurrently scheduled \n" + eventsChan + "", true);
	embedTwo.addField("THREE", "Introduce yourself\nin the " + introChan + "\nchannel", true);
	embedTwo.addField("Becoming a Member", "**You must add yourself to at least one group at the bottom of this channel in order to become a member of the community and gain access to the rest of the community.**");
	channel.send(embedTwo);

	//Rules
	const embedRules = new Discord.RichEmbed();
	embedRules.setTitle("DGC Rules")
	embedRules.setColor("RED");
	embedRules.setDescription(
		"1. Be respectful to all members in the Dauntless Gaming Community\n" +
		"2. Any hate speech is grounds for instant ban\n" +
		"3. No pornographic, adult, or disturbing content shall be posted outside the Explicit Content section. This includes avatars and custom statuses!\n" +
		"4. No spamming messages, advertising, or posting discord servers. This includes same channel, different channels, and private messages. This includes custom statuses!\n" +
		"5. Be respectful of others using the voice channels. If they are using it for gaming, do not interrupt. Disruptive behavior will not be tolerated and can result in being muted or removal from the voice channel.\n" +
		"6. No use of Dauntless, Dauntless Gaming Community, DGC, or it's Artwork without permission from administration. This includes creating clans or guilds under the Dauntless name.\n" +
		"7. If issues arise, contact a Dauntless Gaming Community Staff member. Any mediation and decisions made are final."
	);
	channel.send(embedRules);

	//Social Media
	const embedSocial = new Discord.RichEmbed();
	embedSocial.setTitle("Join us on Social Media");
	embedSocial.setColor("GOLD");
	embedSocial.setDescription(
		"Check out our Social Media! Want to see what #gamesies are featured? Interesting game related news?  Want to help us grow our following? Give us a follow!\n\n" +
		"[Follow us on Twitter](https://twitter.com/dauntlessgc)\n" +
		"[Follow us on Facebook](https://www.facebook.com/Dauntless-Gaming-Community-105069480897689)\n" +
		"[Follow us on Instagram](https://www.instagram.com/dauntless_gaming_community)\n" +
		"[Follow us on Twitch](https://www.twitch.tv/dauntlessgc)\n" +
		"[Follow us on Youtube](https://www.youtube.com/channel/UCHrE2Q9-mWH67b4YGe3zE6A)\n\n" + 
		"**Post in Gamesies**\n" + 
		"Not only is it interesting to see everyone's screenshots that they post but " + gamesiesChan + " are a very important part of our social media marketing. Posting your screenshots helps us tremendously. If you can find the time to take some interesting screenshots as your gaming and posting them in the " + gamesiesChan + " channel then that would be greatly appreciated!"
	);
	channel.send(embedSocial);

	//Super proud of this part. "embedThree1"...lol
	const embedThree1 = new Discord.RichEmbed();
	embedThree1.setTitle("Recruit your Friends!");
	embedThree1.setDescription("If you enjoy your first few hours/days in Dauntless then please consider recruiting your friends. Everyone wins when we all get our friends gaming in one place!");
	embedThree1.setColor("RED");
	channel.send(embedThree1);

	//Roles
	const embedRoles = new Discord.RichEmbed();
	embedRoles.setTitle("Assignable Roles");
	embedRoles.setDescription(
		"These roles are used to allow members to get notifications for specific content in our community. It's highly recommended that you utilize these custom roles!\n\n" +
		announcementsRole + " : Get notifications for announcements\n" +
		eventsRole + " : Get notifications for new and upcoming events\n" +
		streamAlertsRole + " : Get notifications when partnered streamers go live\n" +
		contentCreatorRole + " : Members who stream, create youtube videos, blog, etc\n" + 
		explicitContentRole + " : Members who want to see all the NSFW channels"
	);
	embedRoles.setColor("GOLD");

	channel.send(embedRoles);

	//Groups
	const embedGroups = new Discord.RichEmbed();
	embedGroups.setTitle("Groups");
	embedGroups.setDescription("Please join at least one group below to become a member of DGC and gain access to the rest of the community. To join a group please click the reactions that correspond to the games and platforms that you play.");
	embedGroups.setColor("RED");
	channel.send(embedGroups);




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

	/*const embedDonations = new Discord.RichEmbed();
	embedDonations.setTitle(":moneybag: Donations :moneybag:")
	embedDonations.setColor("GOLD");
	embedDonations.setDescription("Our staff & Contributors spend $150-200 a month to keep Dauntless alive, fun, and growing. If you love this community and are able to help with it's costs then "
	+ "please consider donating via [Patreon](https://www.patreon.com/dauntlessGC) or our [PayPal](https://paypal.me/pools/c/8lmUbRudi2).\n\n"
	+ "Your money will be put towards Server fees for Aerbot, Advertising and Marketing fees, Giveaways, Contests, Launch Events, Raffles, and more!\n\n")
	embedDonations.setFooter("Thank you so much to all of our Contributors! You help make Dauntless posttible and we could never thank you all enough");
	channel.send(embedDonations);*/

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
