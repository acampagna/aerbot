const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Command = require("../Command.js");
const Aerbot = mongoose.model('Aerbot');
const Trivia = mongoose.model('Trivia');
const TriviaConfig = require("../trivia.json");
const TriviaUtil = require("../utils/TriviaUtil.js");
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");
const UserModel = mongoose.model('User');
const TriviaService = require("../services/TriviaService");

module.exports = new Command({
	name: "trivia",
	description: "Video Game Trivia!",
	syntax: "trivia",
	admin: true,
	invoke
});

var testMode = false;
const timeToAnswer = 30000;
var timeLeftToAnswer = 0;
const bufferTime = 4000;
var currentTriviaId = undefined;
var currentTriviaMessageId = undefined;
var totalQuestions = 0;
var currentQuestion = 0;
var currentStage = 0; // 0 = Ended, 1 = Started, 2 = Asking Question, 3 = Concluding Question, 4 = Displaying Leaderboard
//var client = undefined;
//var serverData = undefined;

const TS = new TriviaService();

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	//router(params[0]);

	if(params[2] === "test"){
		testMode = true;
	}

	switch(params[0]) {
		case 'start':
			if(currentTriviaId) {
				return Promise.resolve("Trivia already in progress!");
			} else {
				if(!isNaN(params[1]) && parseInt(params[1]) <= 20) {
					totalQuestions = parseInt(params[1]);
				} else {
					totalQuestions = 10;
				}
				TS.startGame(client,serverData,totalQuestions,testMode);
			}
			break;
		case 'end':
		case 'stop':
			if(currentTriviaId) {
				TS.sendLeaderboard(client, serverData);
				TS.resetTrivia();
				return Promise.resolve("Trivia Ended!");
			} else {
				return Promise.resolve("Trivia not in progress!");
			}
			break;
		case 'leaderboard':
			if(currentTriviaId) {
				TS.sendLeaderboard(client, serverData);
			} else {
				return Promise.resolve("Trivia not in progress!");
			}
			break;
		case 'question':
			console.log("Doing Trivia Question");
			//TS.initClientServer(client, serverData);
			TS.sendQuestion(client, serverData);
			//TS.deinitClientServer();
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
	currentTriviaMessageId = undefined;
	currentQuestion = 0;
	totalQuestions = 0;
	currentStage = 0;
	testMode = false;
}

async function startTrivia() {
	currentTriviaId = Math.floor(Date.now() / 1000);
	currentQuestion = 0;
	Aerbot.set("currentTriviaId", currentTriviaId);
	currentStage = 1;
}

async function sendQuestion(client, serverData) {
	currentQuestion++;

	timeLeftToAnswer = timeToAnswer;

	var question = TriviaUtil.sendTriviaQuestion(client, serverData, currentQuestion, totalQuestions, timeLeftToAnswer);

	await setTimeout(async function() {tickDownAndEdit(question, client, serverData);}, 2000);
}

async function tickDownAndEdit(question, client, serverData){
	timeLeftToAnswer = timeLeftToAnswer - 2000;

	if(timeLeftToAnswer <= 0) {
		var triviaMessage = client.channels.get(serverData.triviaChannelId).messages.get(currentTriviaMessageId);
		triviaMessage.edit(TriviaUtil.getQuestionEmbed(question, currentQuestion, totalQuestions, timeLeftToAnswer));

		currentTriviaMessageId = undefined;
		concludeQuestion(question, client, serverData);
	} else {
		await setTimeout(async function() {tickDownAndEdit(question, client, serverData);}, 2000);
		
		if(!currentTriviaMessageId) {
			var triviaMsgId = await Aerbot.get("currentTriviaId");
			currentTriviaMessageId = triviaMsgId.value;
		}
		
		var triviaMessage = client.channels.get(serverData.triviaChannelId).messages.get(currentTriviaMessageId);

		triviaMessage.edit(TriviaUtil.getQuestionEmbed(question, currentQuestion, totalQuestions, timeLeftToAnswer));
	}
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
		if(!user.bot && user.id) {
			if(!testMode) {
				UserModel.findById(user.id).exec()
				.then(userData => {
					HandleActivity(
						client,
						messageReaction.message.guild,
						{trivia: "question"},
						userData
					);
				});
			}
			winnerStr += user.username + ", ";
			Trivia.saveOrUpdate(currentTriviaId, user.id, question.points);
		}
	});

	const embed = new Discord.RichEmbed();
	embed.setTitle("TRIVIA");
	embed.setColor("GOLD");
	embed.setDescription("The correct answer was: " + question.answer_emoji + " " + question.answer + "\n\n**Winners**: " + winnerStr);

	triviaChannel.send(embed);

	if(currentTriviaId) {
		if(Math.floor(totalQuestions / 2) == currentQuestion || currentQuestion >= totalQuestions) {
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

		if(winner && winner.userId) {
			if(!testMode) {
				UserModel.findById(winner.userId).exec()
				.then(userData => {
					HandleActivity(
						client,
						messageReaction.message.guild,
						{trivia: "game"},
						userData
					);
				});
			}
			let member = client.guilds.get(serverData._id).members.get(winner.userId);
			embed.setThumbnail(member.user.avatarURL);
			embed.setDescription("And the winner is... " + member + " with " + winner.points + " points!");
		} else {
			embed.setDescription("And the winner is... nobody?!");
		}

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

		triviaChannel.send(embed).then(async m => {
			if(currentQuestion < totalQuestions) {
				await setTimeout(async function() {sendQuestion(client, serverData);}, bufferTime);
			} else {
				await setTimeout(async function() {sendWinner(client, serverData);}, bufferTime);
			}
		});
	});
}