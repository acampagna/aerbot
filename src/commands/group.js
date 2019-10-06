const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const Discord = require("discord.js");

module.exports = new Command({
	name: "group",
	description: "Adds/Removes a group for a user",
	syntax: "group",
	admin: false,
	invoke
});

/**
 * Lists all groups. Adds/Removes a group for a user if they specify a group by adding the group's role to them.
 * UNFINISHED. NEEDS TO BE CLEANED UP A BIT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	var groupName = params.join(" ").toLowerCase().trim();

	if(groupName.length === 0) {
		return new Promise(function(resolve, reject) {
			var emojis = new Array();
			const embed = new Discord.RichEmbed();
			var desc = "";
			embed.setColor("BLUE");
			embed.setTitle(`__Groups__`)
			Group.findAllPublicGroups().then(groups => {
				groups.forEach(group => {
					//embed.addField(group.name, group.numMembers + " members", true);
					var groupName = group.name;
					if(group.emoji) {
						emojis.push(group.emoji);
						var emoji = client.emojis.get(group.emoji);
						if(emoji) {
							desc = desc + emoji + " " + group.name + " - " + group.numMembers + " gamers\n";
						} else {
							desc = desc + group.name + " - " + group.numMembers + " gamers\n";
						}
						/*if(emoji) {
							embed.addField(emoji, groupName, true);
						} else {
							embed.addField(groupName, group.numMembers + " gamers", true);
						}*/
						
					} else {
						//embed.addField(groupName, group.numMembers + " gamers");
						desc = desc + group.name + " - " + group.numMembers + " gamers\n";
					}
				});
				embed.setDescription(desc);
				embed.setFooter("Click the corresponding reactions below or use the !group command to join a group");
				resolve ({message: embed, reactions: emojis });
			});
		});
	} else {
		var role = message.guild.roles.find(role => role.name.toLowerCase().trim() === groupName.toLowerCase().trim());

		if(role) {
			if(message.member.roles.find(role => role.name.toLowerCase().trim() === groupName.toLowerCase().trim())) {
				message.member.removeRole(role);
				Group.findGroupByName(groupName).then(group => {
					console.log(group);
					group.decrementNumMembers();
					group.removeMember(groupName,message.member.id);
				}).catch(console.error);
		
				return Promise.resolve("Removed you from group " + groupName);
			} else {
				message.member.addRole(role);
				Group.findGroupByName(groupName).then(group => {
					console.log(group);
					group.incrementNumMembers();
					group.addMember(groupName,message.member.id);

					if(group.platforms.length > 0) {
						console.log("platforms > 0");
						if(group.platforms.length === 1) {
							Group.findGroupById(group.platforms[0]).then(platformGroup => {
								console.log(platformGroup);
								var role2 = message.guild.roles.find(role => role.name.toLowerCase().trim() === platformGroup.name.toLowerCase().trim());

								if(!message.member.roles.find(role => role.name.toLowerCase().trim() === platformGroup.name.toLowerCase().trim())) {
									message.member.addRole(role2);
									platformGroup.incrementNumMembers();
									platformGroup.addMember(platformGroup.name,message.member.id);
									message.reply("Automatically added you to group " + platformGroup.name);
								}
							}).catch(console.error);
						} else {
							//Do work to ask if they want to join any of the platforms for the game.
						}
					}

				}).catch(console.error);
		
				return Promise.resolve("Added you to group " + groupName);
			}
		} else {
			return Promise.resolve("Role " + groupName + " doesn't exist!");
		}
	}
}