// @ts-ignore
const LotteryData = require("../models/lottery-data.js");
const Discord = require("discord.js");

const ordinals = [
	'1st',
	'2nd',
	'3rd',
	'4th',
	'5th',
	'6th',
	'7th',
	'8th',
	'9th',
	'10th',
	'11th',
	'12th',
	'13th',
	'14th',
	'15th'
];

function announce(guildData) {
	return new Promise(function(resolve, reject) {
		LotteryData.findOne({ lottery_id: String(guildData.currentLotteryID) }).then(lotteryData => {
			guildData.lastLotteryAnnounce = new Date();
			guildData.save();
			let embed = getLotteryAnnouncement(lotteryData, lotteryData.start_date, lotteryData.end_date);
			resolve(embed);
			//resolve ({everyone: true, message: embed });
		});
	});
}

function lotteryHeader(lotteryData, titleExtra) {
	const embed = new Discord.RichEmbed();
	if(lotteryData.title) {
		let title = lotteryData.title;
		if(titleExtra)
			title += " " + titleExtra;
		embed.setTitle(`__${title}__`)
	}
	if(lotteryData.description) {
		embed.setDescription(lotteryData.description);
	}
	if(lotteryData.question) {
		embed.addField("Question", `${lotteryData.question}`);
	}
	return embed;
}

function getLotteryBase(lotteryData, starts, ends) {
	const embed = lotteryHeader(lotteryData);
	
	embed.addField("Starts", starts);
	embed.addField("Ends", ends);

	let prizesStr = "";
	for (i = 0; i < lotteryData.prizes.length; i++) { 
		if(i != 0)
			prizesStr += "\n";
		prizesStr += ordinals[i] + " Place: " + lotteryData.prizes[i];
	}

	embed.addField("Prizes", prizesStr);

	return embed;
}

function getLotteryAnnouncement(lotteryData, starts, ends) {
	const embed = getLotteryBase(lotteryData, starts, ends);

	if(lotteryData.question) {
		embed.addField("How to Enter", "Type `!lottery enter <answer>` in this channel to enter the lottery. Replace <answer> with your answer to the above question.");
	} else {
		embed.addField("How to Enter", "Type `!lottery enter` in this channel to enter the lottery");
	}

	embed.setFooter("Total Entries: " + lotteryData.num_entries);

	return embed;
}

module.exports = {
	announce
};