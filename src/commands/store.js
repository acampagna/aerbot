const CoreUtil = require("../utils/Util.js");
const Validation = require("../utils/ValidationUtil.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const StoreItem = mongoose.model('StoreItem');
const User = mongoose.model('User');
const Discord = require("discord.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const StoreService = require("../services/StoreService");

const SS = new StoreService();

module.exports = new Command({
	name: "store",
	description: "Shop at the Dauntless Store!",
	syntax: "store",
	admin: false,
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
	var buyName = paramStr.replace("buy","").trim();
	var name = newParams[1];
	var value = newParams[2] ? newParams[2] : "";
	var other = newParams[3] ? newParams[3] : "";

	if(cmd === "help") {
		return Promise.resolve("Under Construction");
	}

	switch(params[0]) {
		case 'create':
			if(CoreUtil.isMemberAerfalle(message.member)) {
				if(name === "help") {
					const embed = new Discord.RichEmbed();
					embed.setColor("RED");
					embed.setTitle(`__Create Store Item Help__`);
					embed.setDescription("!store create \"item name\" price \"item description\"");
					return (DiscordUtil.processEmbed(embed, client));
				}
				console.log(Validation.isEmpty(name))
				console.log(parseInt(value))
				if (!Validation.isEmpty(name) && parseInt(value)) {
					StoreItem.createStoreItem(name, value, other);
					return Promise.resolve("Created " + name + " for Ð" + value + "\n " + other);
				} else {
					return Promise.resolve("You must specify an item name and price.");
				}
			} else {
				return Promise.resolve("You must be Aerfalle to use this command.");
			}
			break;
		case 'buy':
			return new Promise(async function(resolve, reject) {
				//if(CoreUtil.isMemberAerfalle(message.member)) {
					var item = await StoreItem.findStoreItemByName(buyName);
					var user = await User.findById(message.member.id);

					if(item && user) {
						console.log("BUY COMMAND ITEM:");
						console.log(item);
						console.log(user);
						if(user.currency >= item.cost) {
							SS.handleBuyCommand(message, item, client);
							resolve("");
						} else {
							resolve("You don't have enough currency to buy " + buyName);
						}
					} else {
						resolve("Could not find item " + buyName);
					}
					
				/*} else {
					resolve("You must be Aerfalle to use this command.");
				}*/
			});
			break;
		resolve("Disabled to fix a bug. Will return shortly!");
		default:
			return new Promise(function(resolve, reject) {
				console.log("LISTING SHOP ITEMS");
				const embed = new Discord.RichEmbed();
				embed.setColor("RANDOM");
				embed.setTitle(`__DAUNTLESS STORE__`);
				var desc = "**UNDER CONSTRUCTION** - Bugs may exist!\n\nWelcome to the Dauntless Store! To purchase something use the command provided at the end of it's description.";

				StoreItem.findAll().then(items => {
					items.forEach(item => {
						if(item.active) {
							desc += desc.length === 0 ? "" : "\n\n";
							desc += "**" + item.name + "** - Ð" + item.cost + "\n" + item.description + "\n`!store buy " + item.name + "`";
						}
					});
					embed.setDescription(desc);

					resolve (DiscordUtil.processEmbed(embed, client));
				});
			});
	}
}
