const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');

module.exports = new Command({
	name: "group-edit",
	description: "Edits a group in the group system",
	syntax: "group-edit",
	admin: true,
	invoke
});

/**
 * Edits a group in the system. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	/*let newParams = new Map(
		params.join(" ").split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/\"/g, "").split(":").map(m => m.trim())).map(([k, v]) => [k.toLowerCase(), v])
	);
	CoreUtil.dateLog(newParams);
	var groupName = newParams.get('name');
	var groupEmoji = newParams.get('emoji');
	var groupList = (newParams.get('list') == 'true') || true;
	//var channelName = groupEmoji + groupName;

	CoreUtil.dateLog(groupName);
	CoreUtil.dateLog(groupEmoji);
	CoreUtil.dateLog(groupList);*/

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

	var groupName = newParams[0];
	var cmd = newParams[1];
	var value = newParams[2];

	if(groupName && cmd && value && groupName.length > 0) {
		return new Promise(function(resolve, reject) {
			Group.findGroupByName(groupName).then(group => {
				if(!group) {
					resolve("Could not find group " + groupName);
				} else {
					console.log(group);
					switch(cmd) {
						case 'name':
							//Need to add the code to edit the role name and channel name
							if (value.length > 0) {
								group.name = value;
							} else {
								resolve("You must specify a new name.");
							}
							break;
						case 'emoji':
							if (value.length > 0) {
								var splitEmoji = value.split(":");
								var emojiId = splitEmoji[2].substr(0,splitEmoji[2].length-1);
								group.emoji = emojiId;
							} else {
								resolve("You must add a valid emoji");
							}
							break;
						case 'add-platform':
							if (value.length > 0) {
								Group.findGroupByName(groupName).then(group => {
									Group.findGroupByName(value).then(platform => {
										group.addPlatform(groupName, platform.id);
									}).catch(console.error);
								}).catch(console.error);
							} else {
								resolve("You must add a valid group id");
							}
							break;
						case 'remove-platform':
							if (value.length > 0) {
								Group.findGroupByName(value).then(platform => {
									Group.removePlatform(groupName, platform.id);
								}).catch(console.error);
							} else {
								resolve("You must add a valid group id");
							}
							break;
						/*case 'list':
							if (message.mentions.roles.size > 0) {
								serverData.updateMemberRoleId(message.mentions.roles.first().id)
							} else {
								return Promise.resolve("You must @mention an existing role");
							}
							break;*/
						default:
							resolve(cmd + " is an invalid group-edit command");
					}
					group.save();
					resolve("Set " + groupName + "'s " + cmd + " to " + value);
				}
			}).catch(err => {
				console.error(err);
				resolve("An error has occured. Contact Aerfalle!");
			});
		});
	} else {
		return Promise.resolve("Invalid Parameters for group-edit");
	}
}
