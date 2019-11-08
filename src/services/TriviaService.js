const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Trivia = mongoose.model('Trivia');
const TriviaUtil = require("../utils/TriviaUtil.js");
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");
const UserModel = mongoose.model('User');

/**
 * Service to manage Trivia. Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

var testMode = false;
const timeToAnswer = 30000;
var timeLeftToAnswer = 0;
const bufferTime = 4000;
var currentTriviaId = undefined;
var currentTriviaMessageId = undefined;
var totalQuestions = 0;
var currentQuestion = 0;
var currentStage = 0;
var answeredCorrectly = new Array();
//var client = undefined;
//var serverData = undefined;

class TriviaService {
    constructor(){
     if(! TriviaService.instance){
       this._data = [];
       TriviaService.instance = this;
     }
  
     return TriviaService.instance;
    }

    userAnsweredCorrectly(uid) {
        return answeredCorrectly.includes(uid);
    }

    removeUserFromAnsweredCorrectly(uid) {
        answeredCorrectly = CoreUtil.removeArrayItemByValue(answeredCorrectly, uid);
    }

    addUserFromAnsweredCorrectly(uid) {
        answeredCorrectly.push(uid);
    }

    getCurrentTriviaMessageId() {
        return currentTriviaMessageId;
    }

    initClientServer(c, sd) {
        //client = c;
        //serverData = sd;
    }

    deinitClientServer() {
        //client = undefined;
        //serverData = undefined;
    }

    initializeGame() {
        currentTriviaId = Math.floor(Date.now() / 1000);
	    currentQuestion = 0;
	    Aerbot.set("currentTriviaId", currentTriviaId);
    }

    startGame(client, serverData, tq, tm) {
        this.initializeGame();

        //client = c;
        //serverData = sd;
        totalQuestions = tq;
        testMode = tm;

        console.log("GAME STARTED");

        this.sendQuestion(client, serverData);
    }

    getGameInProgress() {
        if(currentTriviaId)
            return true;
        else
            return false;
    }

    endGame() {
        currentTriviaId = undefined;
	    currentTriviaMessageId = undefined;
	    currentQuestion = 0;
	    totalQuestions = 0;
	    currentStage = 0;
        testMode = false;
        //client = undefined;
        //serverData = undefined;
    }

    async sendQuestion(client, serverData) {
        var _this = this;

        currentQuestion++;
        answeredCorrectly = new Array();
        timeLeftToAnswer = timeToAnswer;

        var question = TriviaUtil.sendTriviaQuestion(client, serverData, currentQuestion, totalQuestions, timeLeftToAnswer);
    
        await setTimeout(async function() {_this.tickDownAndEdit(question, client, serverData);}, 2000);
    }
    
    async tickDownAndEdit(question, client, serverData) {
        var _this = this;
        timeLeftToAnswer = timeLeftToAnswer - 2000;
    
        if(timeLeftToAnswer <= 0) {
            var triviaMessage = client.channels.get(serverData.triviaChannelId).messages.get(currentTriviaMessageId);
            triviaMessage.edit(TriviaUtil.getQuestionEmbed(question, currentQuestion, totalQuestions, timeLeftToAnswer));
    
            currentTriviaMessageId = undefined;
            this.concludeQuestion(question, client, serverData);
        } else {
            await setTimeout(async function() {_this.tickDownAndEdit(question, client, serverData);}, 2000);
            
            if(!currentTriviaMessageId) {
                var triviaMsgId = await Aerbot.get("currentTriviaId");
                currentTriviaMessageId = triviaMsgId.value;
            }

            var triviaMessage = client.channels.get(serverData.triviaChannelId).messages.get(currentTriviaMessageId);
    
            triviaMessage.edit(TriviaUtil.getQuestionEmbed(question, currentQuestion, totalQuestions, timeLeftToAnswer));
        }
    }
    
    async concludeQuestion(question, client, serverData) {
        var _this = this;
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
                            triviaMessage.guild,
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
                await setTimeout(async function() {_this.sendLeaderboard(client, serverData);}, bufferTime);
            } else {
                await setTimeout(async function() {_this.sendQuestion(client, serverData);}, bufferTime);
            }
        }
    }
    
    async sendWinner(client, serverData) {
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
    
            this.endGame();
    
        });
    }
    
    async sendLeaderboard(client, serverData) {
        var _this = this;
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
                    await setTimeout(async function() {_this.sendQuestion(client, serverData);}, bufferTime);
                } else {
                    await setTimeout(async function() {_this.sendWinner(client, serverData);}, bufferTime);
                }
            });
        });
    }
}
  
const instance = new TriviaService();

module.exports = TriviaService