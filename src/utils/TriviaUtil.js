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

const questionOptions = new Array("🇦", "🇧", "🇨", "🇩", "🇪");
const questionOptionsLetters = new Array("A", "B", "C", "D", "E");

function getMultipleChoiceAnswers(choiceType, numChoices) {
	var choicesArr = Array();
	switch(choiceType) {
		case 'characters':
			choicesArr = CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.characters, numChoices);
			break;
		case 'years':
			choicesArr = CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.years, numChoices);
			break;
		case 'games':
			choicesArr = CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.games, numChoices);
			break;
		case 'pokemon':
			choicesArr = CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.pokemon, numChoices);
			break;
		case 'retro_games':
			choicesArr = CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.retro_games, numChoices);
			break;
		default:
			choicesArr = new Array("Error", "Error", "Error", "Error");
	}

	return choicesArr;
}

function difficultyText(d) {
	if(isNaN(d)){
		d = 2;
	}

	switch(Math.round(d)){
		case 1:
			return "easy";
		case 2:
			return "normal";
		case 2:
			return "hard";
		default:
			return "normal";
	}
}

function difficultyPoints(d) {
	switch(Math.round(d)){
		case 1:
			return 0.5;
		case 2:
			return 1;
		case 2:
			return 1.5;
		default:
			return 1;
	}
}

function calculateQuestionPoints(d) {
	var rnd = Math.round((Math.random() * 0.25)*100)/100;

	return (difficultyPoints(d) + rnd);
}

function setOptions(question) {
	//console.log(CoreUtil.getRandomArray(TriviaConfig.multipleChoiceAnswers.characters, 4));
	if(question.type.toLowerCase() === "tf") {
		question.choices.push("True");
		question.choices.push("False");
		question.answer_emoji = questionOptions[CoreUtil.arraySearch(question.choices, question.answer)];
	} else {
		if(question.choices.length <= 2 && question.choice_type) {
			//question.choices.concat(getMultipleChoiceAnswers(question.choice_type, 3-question.choices.length));
			question.choices = getMultipleChoiceAnswers(question.choice_type,3);
		}
		if(!question.choices.includes(question.answer)) {
			question.choices.push(question.answer);
		}

		console.log(question.choices);

		if(question.randomize) {
			console.log("[[[Randomizing Choices]]]");
			question.choices.sort(() => Math.random() - 0.5);
		}

		console.log(question.choices);

		question.answer_emoji = questionOptions[CoreUtil.arraySearch(question.choices, question.answer)];

		//var rnd = Math.floor((Math.random() * 5 ) + 1);
		var rnd = 2;
		console.log("rnd " + rnd)
		if(question.choices.length < 5) {
			console.log("choices < 5");
			switch(rnd) {
				case 1:
					question.choices.push("None of the Above");
					//question.difficulty += 0.5;
					break;
				case 2:
					var rndOptionOne = Math.floor((Math.random() * question.choices.length));
					var rndOptionTwo = rndOptionOne;
					while(rndOptionOne === rndOptionTwo) {
						rndOptionTwo = Math.floor((Math.random() * question.choices.length));
					}
					question.choices.push( 
						questionOptionsLetters[CoreUtil.getLowerNumber(rndOptionOne,rndOptionTwo)] + 
						" and " + 
						questionOptionsLetters[CoreUtil.getHigherNumber(rndOptionOne,rndOptionTwo)]
					);
					//question.difficulty += 0.5;
					break;
				default:
					break;
			}
		}
	}
}

function getRandomTriviaQuestion() {
	let questionNumber = Math.floor(Math.random()*TriviaConfig.questions.length);
	//let questionNumber = 5;
	var question = TriviaConfig.questions[questionNumber];

	if(!question.hasOwnProperty("randomize")) {
		console.log("Does not have randomize property");
		question.randomize = true;
	}

	setOptions(question);

	question.points = calculateQuestionPoints(question.difficulty);

	return question;
}

function sendTriviaQuestion(client, serverData, qn, tq, tl) {
	var triviaChannel = client.channels.get(serverData.triviaChannelId);
	var question = getRandomTriviaQuestion();

	console.log(question);
	
	/*const embed = new Discord.RichEmbed();
	var descStr = "**" + question.question + "**\n";
	embed.setTitle("TRIVIA Question " + qn + "/" + tq);
	embed.setColor("RANDOM");*/

	var i = 0;
	const questionOptionsUsed = Array();
	question.choices.forEach(option => {
		//descStr += "\n" + questionOptions[i] + " " + option;
		questionOptionsUsed.push(questionOptions[i]);
		i++;
	});
	i = 0;

	//embed.setDescription(descStr);

	/*if(question.author) {
		embed.setFooter("Question provided by " + question.author);
		//embed.setFooter("Question provided by " + question.author + "\nIf you make a mistake you may change your answer. If you have two answered selected by the end of the question then you'll automatically get the question wrong.");
	}*/

	//triviaChannel.send(embed);

	const embed = getQuestionEmbed(question, qn, tq, tl);

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

function getQuestionEmbed(question, qn, tq, tl) {
	const embed = new Discord.RichEmbed();
	var descStr = "**" + question.question + "**\n";
	embed.setTitle("TRIVIA Question " + qn + "/" + tq);
	embed.setColor("RANDOM");

	var i = 0;
	const questionOptionsUsed = Array();
	question.choices.forEach(option => {
		descStr += "\n" + questionOptions[i] + " " + option;
		//questionOptionsUsed.push(questionOptions[i]);
		i++;
	});
	i = 0;

	descStr += "\n\nTime Left to Answer: " + (tl/1000);

	embed.setDescription(descStr);

	if(question.author) {
		embed.setFooter("Question provided by " + question.author);
		//embed.setFooter("Question provided by " + question.author + "\nIf you make a mistake you may change your answer. If you have two answered selected by the end of the question then you'll automatically get the question wrong.");
	}

	return embed;
}

module.exports = {
	getRandomTriviaQuestion,
	sendTriviaQuestion,
	getQuestionEmbed
};