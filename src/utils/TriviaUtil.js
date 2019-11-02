/**
 * Member utilities. Only deals with member exp right now.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
const mongoose = require('mongoose');
const CoreUtil = require("./Util.js");
const Discord = require("discord.js");
const TriviaConfig = require("../trivia.json");
const Aerbot = mongoose.model('Aerbot');

const questionOptions = new Array("🇦", "🇧", "🇨", "🇩", "🇪")

function getMultipleChoiceAnswers(choiceType, numChoices) {
	switch(choiceType) {
		case 'characters':
			return CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.characters, numChoices);
		case 'years':
			return CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.years, numChoices);
		case 'games':
			return CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.games, numChoices);
		case 'pokemon':
			return CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.pokemon, numChoices);
		default:
			return new Array("Error", "Error", "Error", "Error");
	}
}


function setOptions(question) {
	//console.log(CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.characters, 4));
	if(question.type.toLowerCase() === "tf") {
		question.choices.push("True");
		question.choices.push("False");
		question.answer_emoji = questionOptions[CoreUtil.arraySearch(question.choices, question.answer)];
	} else {
		if(question.choices.length <= 1) {
			if(question.choice_type) {
				console.log(question);
				question.choices = getMultipleChoiceAnswers(question.choice_type, 3);
			}
		}
		if(!question.choices.includes(question.answer)) {
			question.choices.push(question.answer);
		}

		question.choices.sort(() => Math.random() - 0.5);

		question.answer_emoji = questionOptions[CoreUtil.arraySearch(question.choices, question.answer)];

		//var rnd = Math.floor((Math.random() * 5 ) + 1);
		var rnd = 2;
		console.log("rnd " + rnd)
		if(question.choices.length < 5) {
			console.log("choices < 5");
			switch(rnd) {
				case 1:
					question.choices.push("None of the Above");
					break;
				case 2:
					var rndOptionOne = Math.floor((Math.random() * question.choices.length ) + 1);
					var rndOptionTwo = rndOptionOne;
					while(rndOptionOne === rndOptionTwo) {
						rndOptionTwo = Math.floor((Math.random() * question.choices.length ) + 1);
					}
					question.choices.push("\\" + 
						questionOptions[CoreUtil.getLowerNumber(rndOptionOne,rndOptionTwo)] + 
						" or " + "\\" + 
						questionOptions[CoreUtil.getHigherNumber(rndOptionOne,rndOptionTwo)]
					);
					break;
				default:
					break;
			}
		}
	}
}

function getRandomTriviaQuestion() {
	let questionNumber = Math.floor(Math.random()*TriviaConfig.questions.length);
	var question = TriviaConfig.questions[questionNumber];
	setOptions(question);

	return question;
}

function sendTriviaQuestion(client, serverData, qn, tq) {
	var triviaChannel = client.channels.get(serverData.triviaChannelId);
	var question = getRandomTriviaQuestion();

	console.log(question);

	const embed = new Discord.RichEmbed();
	embed.setTitle("TRIVIA Question " + qn + "/" + tq);
	embed.setColor("RANDOM");
	embed.setDescription("**" + question.question + "**");

	var i = 0;
	const questionOptionsUsed = Array();
	question.choices.forEach(option => {
		embed.addField(questionOptions[i], option);
		questionOptionsUsed.push(questionOptions[i]);
		i++;
	});
	i = 0;

	if(question.author) {
		embed.setFooter("Question provided by " + question.author + "\nIf you make a mistake you may change your answer. If you have two answered selected by the end of the question then you'll automatically get the question wrong.");
	}

	//triviaChannel.send(embed);
	triviaChannel.send(embed).then(function (message) {
		Aerbot.set("currentTriviaId", message.id);
		CoreUtil.asyncForEach(questionOptionsUsed, async (data) => {
			await message.react(data);
		});
	}).catch(function() {
		//Something
	});

	return question;
}

module.exports = {
	getRandomTriviaQuestion,
	sendTriviaQuestion
};