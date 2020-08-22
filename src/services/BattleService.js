const CoreUtil = require("../utils/Util.js");
const Discord = require("discord.js");
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');
const UserModel = mongoose.model('User');
const Fighter = require("./gacha/battle/Fighter");
const HandleActivity = require("../HandleActivity");
const Aerbot = mongoose.model('Aerbot');

const god = "Aerbot";
const msgSpeed = 4500;

var message = undefined;

var messages = [];

var entries = new Map();
var wager = 0;

var bets = new Map();

var battleId = undefined;

var client = undefined;
var server = undefined;

var state = 0; // 0 = none, 1 = entry phase, 2 = bet phase, 3 = battle phase


var weapons = [
    "GPD (Giant Purple Dildo)",
    "Dirty Socks",
    "$100 Bill",
    "Buster Sword",
    "Humerun Bat",
    "BFG 9000",
    "Fire Flower",
    "Banana Peel",
    "Star Rod",
    "Master Sword",
    "211-V Plasma Cutter",
    "Golden Gun",
    "Gravity Gun",
    "Hidden Blade",
    "Energy Sword",
    "Blades Of Chaos",
    "Fat Man",
    "Scorpion's Kunai",
    "Red Shell",
    "Drugs & Alcohol",
    "COVID-19"
];

var showdownHits = [
    "{$1} lands a hit to the {$b} with their {$w}",
    "{$1} does a roundhouse kick to {$2}'s {$b}",
    "{$1} dodges an attack then bites {$2}'s {$b}",
    "{$1} grazes {$2} in the {$b} with their {$w}",
    "{$1} spanks {$2} on the {$b} with their {$w}",
    "{$1} goes invisible, flanks {$2}, and attacks from behind with their {$w}",
    "{$1} throws a pack of {$a} at {$2}",
    "A wild {$a} comes out of nowhere, charges at {$2}, and hits them right in the {$b}",
    "{$1} cancels {$2}’s Netflix subscription",
    "{$2} tried to attack {$1} but {$1} parrys and ripostes with their trusty {$w}.",
    "{$1} attacks {$2} with {$w}. It was super effective!",
    "{$1} focuses their chakra and hadoukens the *shit* out of {$2}."
];

var showdownArenas = [
    "in Aerfalle's closet",
    "in Deathsfew's sex dungeon",
    "on top of Mt. Doom",
    "in Realm's Meme Haven",
    "in Summoner's Rift",
    "in King's Canyon",
    "at the Raccoon City Police Department",
    "in Hyrule Castle",
    "at the Silent Hill Elementary School",
    "somewhere in Azeroth",
    "in Green Hill Zone",
    "in Dust2",
    "at the Apollo Square in Rapture",
    "in FancyAlly's Magical Library",
    "in Fibonacci's Spiral Outlet"
];

var bodyParts = [
    "crotch",
    "head",
    "eye",
    "finger",
    "chest",
    "leg",
    "ass",
    "big toe",
    "nipple",
    "boob",
    "taint",
    "heiny",
    "tail"
];

var animals = [
    "Mammoth",
    "Sabertooth Tiger",
    "Pikachu",
    "Pikman",
    "Pachimari",
    "Epona",
    "Magikarp",
    "Chocobo",
    "Caterpie",
    "Yoshi",
    "Claptrap",
    "Goron"
]

var msgColors = {
    showdownDay: "PURPLE",
    showdownAction: "RANDOM",
    mistake: "LUMINOUS_VIVID_PINK",
    annihilation: "RED",
    playerKill: "ORANGE",
    newDay: "AQUA",
    endGame: "BLUE",
    event: "GOLD",
    dailyEvent: "DARK_ORANGE"
};

class BattleService {
    constructor(){
        this.init();
    }

    setClient(c) {
        client = c;
    }

    setServer(s) {
        server = s;
    }

    init() {
        message = undefined;
        messages = [];
        state = 0;
        wager = 0;
        entries = new Map();
        bets = new Map();
        battleId = undefined;

        CoreUtil.dateLog("Initialized Battle Service!");
    }

    initializeGame(msg, bet) {
        if(!this.isGameInProgress()) {
            this.init();

            message = msg;
            state = 1;
            wager = bet;

            battleId = Math.floor(Date.now() / 1000);
	        Aerbot.set("currentBattleId", battleId);
    
            //return this.startGameMessage(message);
        } else {
            //return "A battle is already in progress.";
        }
    }

    startBetting() {
        if(state !== 0) {
            state = 2;

            entries.forEach(function(value, key) {
                message.channel.send(value.getEmbed()).then(msg => {
                    value.setBetMessageId(msg.id);
                    //msg.react("✨").then(() => msg.react("1️⃣").then(() => msg.react("5️⃣").then(() => msg.react("🔟"))));
                    msg.react("1️⃣").then(() => msg.react("5️⃣").then(() => msg.react("🔟")));
                });
            });

            var _this = this;
            setTimeout(function(){  
                _this.startGame();
            }, 30000);
        }
    }

    startGame() {
        if(state !== 0) {
            state = 3;
            console.log("Starting Game!");

            console.log(bets);
    
            this.doShowdown();
    
            this.processMessages();
        }
    }

    endGame(winner, loser) {
        console.log(winner.name + " has beat " + loser.name + "! Cleaning up!");

        //console.log(client);
        //console.log(server);

        var winWager = wager;
        if(winWager >= 5) {
            winWager = (wager-Math.max(1,wager*0.1));
        }

        var loseWager = wager;

        HandleActivity(client,server,{battle_win: winWager},winner.user);
        HandleActivity(client,server,{battle_lose: wager},loser.user);

        var betWinnersStr = "";
        var betLosersStr = "";

        var messageChannel = message.channel;
        bets.forEach(function(value, key) {
            UserModel.findById(key).exec().then(userData => {
                if(userData) {
                    if(value.fighterId === winner.member.id) {
                        var winBet = value.bet;

                        if(winBet >= 5) {
                            winBet = (winBet-Math.max(1,winBet*0.1));
                            messageChannel.send(userData.username + " won Ð" + value.bet + " minus Ð" + Math.max(1,value.bet*0.1) + " gambling fee!");
                        } else {
                            messageChannel.send(userData.username + " won Ð" + winBet + "!");
                        }
                        
                        userData.currency += winBet;
                    } else {
                        messageChannel.send(userData.username + " lost Ð" + value.bet + "!");
                        userData.currency -= value.bet;
                    }
                    userData.save();
                }
            });
        });

        this.init();
    }

    isMessageBetMessage(messageId) {
        var found = false;
        entries.forEach(function(value, key) {
            if(value.getBetMessageId() === messageId)
                found = true;
        });
        return found;
    }

    getFighterByBetMessage(messageId) {
        var found = undefined;
        entries.forEach(function(value, key) {
            if(value.getBetMessageId() === messageId)
                found = value;
        });

        return found;
    }

    memberIsFighter(memberId) {
        var found = false;
        entries.forEach(function(value, key) {
            if(value.member.id === memberId)
                found = true;
        });
        return found;
    }

    addBet(reaction, reactionUser) {
        if(state === 2) {
            var betValue = this.getBetInt(reaction._emoji.name);
    
            var fighter = this.getFighterByBetMessage(reaction.message.id);
    
            if(fighter && !this.memberIsFighter(reactionUser.id)) {
                console.log("Bet Added");
                bets.set(reactionUser.id, {fighterId: fighter.member.id, bet: betValue});
                reaction.message.channel.send(reactionUser + ", You have bet Ð" + betValue + " on " + fighter.name + "! *Note: Only your latest bet counts*");
            } else {
                reaction.message.channel.send("Fighters can't bet. You must place a wager before the fight. *i.e.* `!battle 10 WEAPON HERE` * when initiating the fight to wager Ð10 on winning the fight.*");
            }
        }
    }

    removeBet(reaction, reactionUser) {
        if(state === 2) {
            var betValue = this.getBetInt(reaction._emoji.name);
            var memberId = reactionUser.id;
            var fighter = this.getFighterByBetMessage(reaction.message.id);

            if(fighter && bets.has(memberId) && bets.get(memberId).bet === betValue && bets.get(memberId).fighterId === fighter.member.id) {
                console.log("Bet Deleted");
                bets.delete(memberId);
                reaction.message.channel.send(reactionUser + ", You have removed your bet of Ð" + betValue + " on " + fighter.name + "!");
            }
        }
    }

    getBetInt(emoji) {
        //console.log(emoji);
        switch(emoji) {
            case "1️⃣":
                return 1;
            case "5️⃣":
                return 5;
            case "🔟":
                return 10;
            default:
                return 0;
        }
    }

    getState() {
        return state;
    }

    isGameInProgress() {
        return (state !== 0);
    }

    hasUserEntered(id) {
        return entries.has(id);
    }

    canUserEnter() {
        return (entries.size < 2);
    }

    generateEntry(message, wpn) {
        if(state === 1) {
            var weapon = this.randomPhrase(weapons);
            if(wpn && wpn !== "") {
                weapon = wpn;
            }

            if(entries.size > 0) {
                state = 2;
            }
    
            UserModel.findById(message.member.id).exec().then(userData => {
                if(userData) {
                    entries.set(message.member.id, new Fighter(message.member, userData, weapon));
                    if(entries.size > 1) {
                        this.startBetting();
                    }
                }
            });
        }
        
    }

    randomPhrase(phraseType) {
        var phrase = phraseType[Math.floor(Math.random()*phraseType.length)];
        return phrase;
    }

    randomEntry() {
        let keys = Array.from(entries.keys());
        var entry = entries.get(keys[Math.floor(Math.random() * keys.length)]);

        return entry;
    }

    isValidTarget(target) {
        return (!target.dead);
    }

    getBattleWager() {
        return wager;
    }

    numAlive() {
        var alive = 0;
        entries.forEach(function(value, key) {
            if(!value.dead) {
                alive++;
            }
        });

        return alive;
    }

    numDead() {
        var dead = 0;
        entries.forEach(function(value, key) {
            if(value.dead) {
                dead++;
            }
        });

        return dead;
    }

    firstAlivePlayer() {
        var winner = undefined;
        entries.forEach(function(value, key) {
            if(!value.dead && winner === undefined) {
                winner = value;
            }
        });
        return winner;
    }

    firstDeadPlayer() {
        var loser = undefined;
        entries.forEach(function(value, key) {
            if(value.dead && loser === undefined) {
                loser = value;
            }
        });
        return loser;
    }

    processMessages() {
        var winner = this.firstAlivePlayer();
        var loser = this.firstDeadPlayer();

        this.endGameMessage(winner);

        var _this = this;
        this.sendMsgs(messages, msgSpeed, function() {
            _this.endGame(winner, loser);
        });
    }

    sendMsgs(msgs, delay, cb) {
        console.log("msgs.length: " + msgs.length);
        if (msgs.length < 1) {
            return cb();
        }
    
        var remain = msgs.slice(1);
        //var sendRemain = this.sendMsgs.bind(null, remain, delay);

        var _this = this;
        message.channel.send(msgs[0]).then(function() {
            console.log("Sending Msg");
            setTimeout(function() {
                _this.sendMsgs(remain,delay, cb)
            }, delay);
        });
    }

    startGameMessage(message) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Battle!__`);
        embed.setDescription(`${message.member.displayName} has initiated a battle! To duel them type !battle Your Weapon Here`);
        if(wager > 0)
            embed.addField("Wager", `The winner of this battle wins Ð${wager} and the loser loses Ð${wager}`);
        embed.setFooter("Entry Example: !battle Master Sword");
        return embed;
    }

    endGameMessage(winner) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Battle__`);
        embed.setDescription("**" + winner.name + "** and their **" + winner.weapon + "** won the battle against all odds!");

        if(wager > 0) {
            if(wager >= 5) {
                embed.addField("Wager", `${winner.name} won Ð${wager} minus a Ð${Math.max(1,wager*0.1)} gambling fee!`);
            } else {
                embed.addField("Wager", `${winner.name} won Ð${wager}!`);
            }
        }
            
        
        if(winner.member.user && winner.member.user.avatarURL) {
            embed.setThumbnail(winner.member.user.avatarURL);
        }
        embed.setColor(msgColors.endGame);

        messages.push({ embed: embed });
    }

    formatMessage(string, replacements) {
        let str = string;

        str = str.split("{$1}").join("**" + replacements.player1 + "**");
        str = str.split("{$2}").join("**" + replacements.player2 + "**");
        str = str.split("{$3}").join("**" + replacements.player3 + "**");
        
        str = str.replace("{$w}", "**" + replacements.weapon + "**");
        str = str.replace("{$w1}", "**" + replacements.weapon + "**");
        str = str.replace("{$w2}", "**" + replacements.weapon2 + "**");

        str = str.replace("{$a}", "**" + replacements.animal + "**");
        str = str.replace("{$n}", "**" + replacements.number + "**");
        str = str.replace("{$b}", "**" + replacements.bodyPart + "**");
        str = str.replace("{$d}", "**" + replacements.damage + "**");
        str = str.replace("{$hp}", "**" + replacements.hp + "**");
        
        return str;
    }

    doShowdown() {
        var playersAlive = "";
        var player1;
        var player2;

        entries.forEach(function(value, key) {
            if(!value.dead) {
                if(player1) {
                    player2 = value;
                    playersAlive += " vs " + key;
                } else {
                    player1 = value;
                    playersAlive += key;
                }
            }
        });

        //console.log(player1);
        //console.log(player2);

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle__");
        embed.setDescription("Our 2 combatants will fight to the death **" + this.randomPhrase(showdownArenas) + "**");

        embed.addField(player1.name + " Stats", "HP: " + player1.hp + " Strength: " + player1.strength + " Weapon: " + player1.weapon);
        embed.addField(player2.name + " Stats", "HP: " + player2.hp + " Strength: " + player2.strength + " Weapon: " + player2.weapon);
        embed.setFooter(playersAlive);
        embed.setColor(msgColors.showdownDay);
        messages.push({ embed: embed });

        while(player1.hp > 0 && player2.hp > 0) {
            console.log(player1.name + " Health", player1.hp + " | " + player2.name + " Health", player2.hp);
            var p1Attacks = Math.random() >= 0.5;

            var killer;
            var target;

            if(p1Attacks) {
                killer = player1;
                target = player2;
            } else {
                killer = player2;
                target = player1;
            }

            var attackValue = Math.floor(Math.random() * killer.strength) + killer.strength;

            target.takeDamage(attackValue);

            const embed = new Discord.RichEmbed();

            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(showdownHits), 
                    {
                        player1: killer.name,
                        player2: target.name,
                        weapon: killer.weapon,
                        bodyPart: this.randomPhrase(bodyParts),
                        animal: this.randomPhrase(animals),
                        damage: attackValue
                    }
                ) + " for **" + attackValue + "** damage!"
            );

            embed.addField(player1.name + " Health", player1.hp, true);
            embed.addField(player2.name + " Health", player2.hp, true);
            embed.setColor(msgColors.showdownAction);
    
            messages.push({ embed: embed });
        }

        if(player1.hp > player2.hp) {
            this.killPlayer(player2, player1);
        } else {
            this.killPlayer(player1, player2);
        }
    }

    killPlayer(target, killer) {
        if(killer === god) {
            target.killer = god;
        } else {
            target.killer = killer;
            killer.numKills++;
        }
        target.dead = true;
    }

    entryMessage() {
        return "Entered the Arena!";
    }
}

module.exports = BattleService