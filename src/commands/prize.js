const CoreUtil = require("../utils/Util.js");
const Validation = require("../utils/ValidationUtil.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Prize = mongoose.model('Prize');
const Discord = require("discord.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const StoreService = require("../services/StoreService");

const SS = new StoreService();

module.exports = new Command({
	name: "prize",
	description: "Shop at the Dauntless Store!",
	syntax: "prize",
	admin: true,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	var paramStr = params.join(" ");
	var newParams = paramStr.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
	}, {a: ['']}).a
	
	console.log(newParams);
	console.log(newParams[0]);

	var cmd = newParams[0].toLowerCase();
	var name = newParams[1];
	var p1 = newParams[2] ? newParams[2] : "";
	var p2 = newParams[3] ? newParams[3] : "";
	var p3 = newParams[4] ? newParams[4] : "";

	if(cmd === "help") {
		return Promise.resolve("Under Construction");
	}

	switch(params[0]) {
		case 'add':
			if(CoreUtil.isMemberAerfalle(message.member)) {
				if(name === "help") {
					const embed = new Discord.RichEmbed();
					embed.setColor("RED");
					embed.setTitle(`__Add Prize Help__`);
					embed.setDescription("!prize add \"item name\" item key \"item USD value\"");
					//embed.addField("Categories", "Only `steamgame` for now");
					resolve (DiscordUtil.processEmbed(embed, client));
				}

				if (!Validation.isEmpty(name) && !Validation.isEmpty(p1) && parseInt(p2)) {
					Prize.addPrize(name, p1, p2, "steamgame");
					return Promise.resolve("Added prize " + name);
				} else {
					return Promise.resolve("You must specify a prize name, prize key, and prize USD value");
				}
			} else {
				return Promise.resolve("You must be Aerfalle to use this command.");
			}
			break;
		case 'list':
			if(name === "help") {
				const embed = new Discord.RichEmbed();
				embed.setColor("RED");
				embed.setTitle(`__List Prize Help__`);
				embed.setDescription("!prize list <max value>");
				resolve (DiscordUtil.processEmbed(embed, client));
			}

			return new Promise(function(resolve, reject) {
				const embed = new Discord.RichEmbed();
				embed.setColor("RANDOM");
				embed.setTitle(`__Steam Game Prize List__`);

				var desc = "";
				var inList = Array();

				Prize.findAllMaxValue(name ? name : 999).then(items => {
					items.forEach(item => {
						if(!inList.includes(item.slug)) {
							inList.push(item.slug);
							desc += desc.length === 0 ? "" : "\n";
							desc += item.name + " - $" + item.value
						}
					});

					embed.setDescription(desc);

					resolve (DiscordUtil.processEmbed(embed, client));
				});
			});
			break;
		case 'give':
			return new Promise(function(resolve, reject) {
				if(name === "help") {
					const embed = new Discord.RichEmbed();
					embed.setColor("RED");
					embed.setTitle(`__Give Random Prize Help__`);
					embed.setDescription("!prize give <min value> <max value> @ref");
					resolve (DiscordUtil.processEmbed(embed, client));
				}
				if (message.mentions.users.first()) {
					console.log("getting random prize");
					Prize.giveRandomPrize((name && !isNaN(name)) ? (name-0.01) : 0, (p1 && !isNaN(p1)) ? p1 : 999).then(item => {
						console.log(item);
						message.mentions.users.first().send("Congratz on winning a random steam game!\n> Game Name: " + item.name + "\n> Game Value: " + item.value + "\n> Steam Key: " + item.key + "\nhttps://support.steampowered.com/kb_article.php?ref=5414-tfbn-1352");
						resolve ("Congratz " + message.mentions.users.first() + " on winning " + item.name + " ($" + item.value + ")! *Check your private messages from Aerbot for your steam key!*");
					});
				} else {
					resolve("You must @mention a user to give a prize to");
				}
			});
			break;
		case 'sgive':
			return new Promise(function(resolve, reject) {
				if(name === "help") {
					const embed = new Discord.RichEmbed();
					embed.setColor("RED");
					embed.setTitle(`__Give Prize Help__`);
					embed.setDescription("!prize sgive <name> @ref");
					resolve (DiscordUtil.processEmbed(embed, client));
				}
				if (message.mentions.users.first()) {
						Prize.givePrizeByName(name).then(item => {
							console.log(item);
							message.mentions.users.first().send("Congratz on winning a random steam game!\n> Game Name: " + item.name + "\n> Game Value: " + item.value + "\n> Steam Key: " + item.key + "\nhttps://support.steampowered.com/kb_article.php?ref=5414-tfbn-1352");
							resolve ("Congratz " + message.mentions.users.first() + " on winning " + item.name + " ($" + item.value + ")! *Check your private messages from Aerbot for your steam key!*");
						});
					
				} else {
					return("You must @mention a user to give a prize to");
				}
			});
			break;
		default:
			return new Promise(function(resolve, reject) {
				resolve ("Invalid Command");
			});
	}
}