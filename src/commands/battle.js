const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const BattleService = require("../services/BattleService");
const Discord = require("discord.js");
const User = mongoose.model('User');

module.exports = new Command({
	name: "battle",
	description: "Battle another member",
	syntax: "battle",
	admin: false,
	invoke
});

const BATTLE_SERVICE = new BattleService();

/**
 * Battle game!
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {

	var bet = 0;
	var weapon = "";

	if(params) {
		if(!isNaN(params[0])) {
			bet = params[0];
			params.shift();
		}
		weapon = params.join(" ");
	}
	
	if(BATTLE_SERVICE.isGameInProgress()) {
		//Game is in progress. Play the game

		if(BATTLE_SERVICE.hasUserEntered(message.member.id)) {
			return Promise.resolve("You've already entered!");
		} else if(!BATTLE_SERVICE.canUserEnter()) {
			return Promise.resolve("Unable to enter!");
		} else {
			return new Promise(function(resolve, reject) {
				User.findById(message.member.id).exec().then(async user => {
					if(user.currency >= bet) {
						BATTLE_SERVICE.generateEntry(message, weapon);
						resolve("");
					} else {
						resolve("You can not wager more than you have!");
					}
				});
			});
		}
	} else {
		//Game is not in progress. Need to start a game or yell if the user isn't an admin.
		if(CoreUtil.isMemberAdmin(message, serverData)) {
			return new Promise(function(resolve, reject) {
				User.findById(message.member.id).exec().then(async user => {
					if(user.currency >= bet) {
						BATTLE_SERVICE.initializeGame(message, bet);
						BATTLE_SERVICE.generateEntry(message, weapon);
						resolve(BATTLE_SERVICE.startGameMessage(message));
					} else {
						resolve("You can not wager more than you have!");
					}
				});
			});
		} else {
			return Promise.resolve("Currently only admins and mods can start a duel!");
		}
	}
}