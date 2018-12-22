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

function invoke({ message, params, guildData, client }) {
	if(guildData.welcomeChannelId) {
		message.guild.channels.get(guildData.welcomeChannelId).delete();
	}

	let role = message.guild.roles.get(guildData.welcomeRole);
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
		guildData.updateWelcomeChannelId(channel.id);
		const embedOne = new Discord.RichEmbed();
		embedOne.setTitle("Welcome to Dauntless!")
		embedOne.setColor("GOLD");
		embedOne.setDescription("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ipsum tellus, porta quis orci quis, pretium consequat enim. Suspendisse vel justo ut mauris porttitor semper.");
		embedOne.setThumbnail("https://i.imgur.com/6bv1ti2.png");
		//embedOne.setAuthor("Commander","https://i.imgur.com/6bv1ti2.png", "http://www.dauntlessgc.com");
		//embedOne.setURL("http://www.dauntlessgc.com");
		//embedOne.setImage("https://i.imgur.com/6bv1ti2.png");
		channel.send(embedOne);

		const embedTwo = new Discord.RichEmbed();
		embedTwo.setTitle("Setup Your Account!");
		embedTwo.setDescription("Adding groups and setting your gaming accounts are essential to finding friends to play games with. Follow these three easy steps to quickly set yourself up for success in Dauntless");
		embedTwo.setColor("ORANGE");
		embedTwo.addField("ONE", "Add your groups with\nthe **!group** command", true);
		embedTwo.addField("TWO", "Set up your gaming\naccounts with the\n**!account** command", true);
		embedTwo.addField("THREE", "Reward those who\nrecruited you with the\n**!referrer** command", true);
		embedOne.setFooter("This is a welcome channel. You will be removed in 14 days!");
		channel.send(embedTwo);

		const embedThree = new Discord.RichEmbed();
		embedThree.setDescription("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et dui imperdiet, ultricies felis non, tempor est. Praesent id odio velit. Duis egestas tellus sed metus euismod sodales. Sed dapibus facilisis finibus. Sed at sem ac lacus convallis placerat sit amet et diam. Ut malesuada tincidunt sollicitudin. Nam feugiat scelerisque orci, a mollis risus placerat ut. Phasellus quis pulvinar ante, eu lobortis dolor.");
		embedThree.setColor("GREEN");
		embedThree.setAuthor("Dauntless","https://i.imgur.com/bKbSw0F.png", "http://www.dauntlessgc.com");
		channel.send(embedThree);

		const embedFour = new Discord.RichEmbed();
		embedFour.setTitle("Bot Help");
		embedFour.setDescription("Sed nec ultrices quam, eu commodo ex. Curabitur euismod vestibulum urna at efficitur. In a enim ex. Praesent cursus elit et nisl ullamcorper aliquam. Nulla risus lectus, dapibus consequat sollicitudin eu, aliquet ac ante. Aenean at elit sit amet lectus fringilla porttitor. Cras porttitor vitae dolor non dignissim. Morbi egestas lacus vel ligula placerat sagittis. Aenean pellentesque mauris nisl, vulputate cursus lectus dapibus at...");
		embedFour.setColor("RED");
		embedFour.setURL("http://www.dauntlessgc.com");
		channel.send(embedFour);

		const embedFive = new Discord.RichEmbed();
		embedFive.setColor("AQUA");
		embedFive.setImage("https://www.theartroom.org.uk/sites/www.theartroom.org.uk/files/styles/object_listing_image/public/2016-11/Welcome-nobackground.png?itok=JhcDYqx3");
		channel.send(embedFive);

	}).catch(console.error);
	return Promise.resolve("Setting up welcome channel!");
}
