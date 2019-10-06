const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = new Command({
	name: "cleanup",
	description: "Administration Cleanup",
	syntax: "cleanup",
	admin: true,
	invoke
});

/**
 * Ping.Pong.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(`Running Cleanup`);
	/*client.guilds.forEach(server => {
		server.members.forEach(member =>{*/
			var memberId = params[0];
var server = client.guilds.get("524900292836458497");
var member = server.members.get(memberId);
			
			User.findById(memberId).exec()
			.then(user => {
				if(user && user.level) {
					console.log("Processing " + user.username);
					var usrLvl = user.level;
					var highestLevel = 0;

					serverData.levelRoles.forEach(function(value, key) {
						if(key > highestLevel && key <= usrLvl) {
							highestLevel = parseInt(key);
							//REMOVE ME IF CHANGED TO ALL AGAIN!
						}
						if(server.roles.get(value)) {
							member.removeRole(server.roles.get(value));
						}
					});

					if(highestLevel > 0) {
						var roleId = serverData.levelRoles.get(highestLevel.toString());
						//var alreadyGroupMember = (member.roles.get(roleId));

						if(!user.levelRole) {
							user.levelRole = "0";
						}

						//if(!alreadyGroupMember) {
							if(true){

							if(user.levelRole != roleId) {
								console.log(user.username + " removing role");
								if(server.roles.get(user.levelRole)) {
									member.removeRole(server.roles.get(user.levelRole));
								}
							}
							user.levelRole = roleId;
							user.save();
							member.addRole(server.roles.get(roleId));
							console.log(user.username + " adding role");
						} else {
							console.log(user.username + " has the proper role set.");
						}
					}
					if(user.exp < user.messages + user.activityPoints + (user.reactions*4)) {
						console.log(user.username + " does not have enough experience!!!");
					}
				} else {
					console.log(member.displayName + " doesn't have a user record!");
				}
			});
		/*});
	});*/
	return Promise.resolve("Cleanup in progress!");
}