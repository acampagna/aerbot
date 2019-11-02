const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Command = require("../Command.js");
const Aerbot = mongoose.model('Aerbot');
const Trivia = mongoose.model('Trivia');
const TriviaConfig = require("../trivia.json");
const TriviaUtil = require("../utils/TriviaUtil.js");
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");

module.exports = new Command({
	name: "trivia",
	description: "Video Game Trivia!",
	syntax: "trivia",
	admin: true,
	invoke
});

const timeToAnswer = 10000;
const bufferTime = 2500;
var currentTriviaId = undefined;
var totalQuestions = 0;
var currentQuestion = 0;
var currentStage = 0; // 0 = Ended, 1 = Started, 2 = Asking Question, 3 = Concluding Question, 4 = Displaying Leaderboard
//var client = undefined;
//var serverData = undefined;

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	router(params[0]);
	switch(params[0]) {
		case 'start':
			if(currentTriviaId) {
				return Promise.resolve("Trivia already in progress!");
			} else {
				if(!isNaN(params[1])) {
					totalQuestions = parseInt(params[1]);
				}
				startTrivia();
				sendQuestion(client, serverData);
			}
			break;
		case 'end':
			if(currentTriviaId) {
				sendLeaderboard(client, serverData);
				resetTrivia();
				return Promise.resolve("Trivia Ended!");
			} else {
				return Promise.resolve("Trivia not in progress!");
			}
			break;
		case 'leaderboard':
			if(currentTriviaId) {
				sendLeaderboard(client, serverData);
			} else {
				return Promise.resolve("Trivia not in progress!");
			}
			break;
		case 'question':
			console.log("Doing Trivia Question");
			sendQuestion(client, serverData);
			//console.log(question);
			return Promise.resolve("");
		default:
			return Promise.resolve(params[0] + " is an invalid trivia command");
	}
}

//Uses global class variable currentStage
async function router(client, serverData) {
	console.log(currentStage);// 0 = Ended, 1 = Started, 2 = Asking Question, 3 = Concluding Question, 4 = Displaying Leaderboard
	switch(currentStage) {
		case 0:
			break;
		case 1:
			currentStage = 2;
			sendQuestion(client, serverData);
			break;
		case 2:

			break;
		case 3:
			break;
		case 4:
			break;
	}
}

function resetTrivia() {
	currentTriviaId = undefined;
	currentQuestion = 0;
	totalQuestions = 0;
	currentStage = 0;
}

async function startTrivia() {
	currentTriviaId = Math.floor(Date.now() / 1000);
	currentQuestion = 0;
	Aerbot.set("currentTriviaId", currentTriviaId);
	currentStage = 1;
}

async function sendQuestion(client, serverData) {
	currentQuestion++;
	var question = TriviaUtil.sendTriviaQuestion(client, serverData, currentQuestion, totalQuestions);

	await setTimeout(async function() {concludeQuestion(question, client, serverData);}, timeToAnswer);
}

async function concludeQuestion(question, client, serverData) {
	var triviaChannel = client.channels.get(serverData.triviaChannelId);
	var triviaMsgId = await Aerbot.get("currentTriviaId")

	console.log("triviaMsgId: " + triviaMsgId.value);

	var triviaMessage = triviaChannel.messages.get(triviaMsgId.value);

	console.log(question.answer_emoji);

	var answer = triviaMessage.reactions.get(question.answer_emoji);
	var winnerStr = "";

	answer.users.forEach(user => {
		if(!user.bot) {
			winnerStr += user.username + ", ";
			Trivia.saveOrUpdate(currentTriviaId, user.id, 1);
		}
	});

	const embed = new Discord.RichEmbed();
	embed.setTitle("TRIVIA");
	embed.setColor("GOLD");
	embed.setDescription("The correct answer was: " + question.answer_emoji + " " + question.answer + "\n\n**Winners**: " + winnerStr);

	triviaChannel.send(embed);

	if(currentTriviaId) {
		if(Math.floor(totalQuestions / 2) == currentQuestion) {
			await setTimeout(async function() {sendLeaderboard(client, serverData);}, bufferTime);
		} else {
			await setTimeout(async function() {sendQuestion(client, serverData);}, bufferTime);
		}
	}
}

async function sendWinner(client, serverData) {
	var triviaChannel = client.channels.get(serverData.triviaChannelId);

	Trivia.findTriviaById(currentTriviaId).then(triviaData => {

		const embed = new Discord.RichEmbed();
		embed.setTitle("TRIVIA Winner");
		embed.setColor("RANDOM");

		var winner = triviaData[0];
		//HandleActivity(client,server,{trivia: "game"},user);

		let member = client.guilds.get(serverData._id).members.get(winner.userId);
		embed.setThumbnail(member.user.avatarURL);

		embed.setDescription("And the winner is... " + member + " with " + winner.points + " points!");

		triviaChannel.send(embed);

		resetTrivia();

	});
}

async function sendLeaderboard(client, serverData) {
	var triviaChannel = client.channels.get(serverData.triviaChannelId);

	Trivia.findTriviaById(currentTriviaId).then(triviaData => {
		//console.log(triviaData);

		const embed = new Discord.RichEmbed();
		embed.setTitle("TRIVIA Leaderboard");
		embed.setColor("RANDOM");

		var total = 0;
		const limit = 10;

		triviaData.forEach(t => {
			total++;
			if(total <= limit && total > 0) {
				let member = client.guilds.get(serverData._id).members.get(t.userId);

				if(total === 1) {
					let avatar = member.user.avatarURL;
					embed.setThumbnail(avatar);
				}

				if(member){
					embed.addField(total + ". " +  member.displayName, t.points + " points");
				} else {
					total--;
				}	
			}
		});

		triviaChannel.send(embed).then(m => {
			if(currentQuestion < totalQuestions) {
				await setTimeout(async function() {sendQuestion(client, serverData);}, bufferTime);
			} else {
				await setTimeout(async function() {sendWinner(client, serverData);}, bufferTime);
			}
		});
	});
}