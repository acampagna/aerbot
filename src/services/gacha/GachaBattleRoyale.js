const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

const god = "Aerbot";
const gameName = "Battle Royale";

var message = undefined;
var day = 0;
var normalSleepTime = 1000;
var daySleepTime = 2000;

var messages = [];

//Need to move all this to a configuration file
var players = [
    "Contestants",
    "Players"
]

var annihilations = [
    "Oh No! King Poring has crushed {$n} arena contestants!",
    "zRed creates a stew out of {$n} of our tastiest combatants!",
    "An avalanche of {$w}s crushes {$n} players in the arena. Oh the horror!",
    "Thanos just snapped {$n} mortals out of existence"
];

var oneOnOneKills = [
    "{$1} annihilates {$2} with their {$w}",
    "{$1} karate chops {$2} right in the face!",
    "{$1} kills {$2} with a {$w}",
    "{$1} one-shots {$2} with a {$w}",
    "{$1} was given a name: {$2}. The Red God is pleased."
];

var mistakes = [
    "{$1} one-shot themselves",
    "{$1} kills themselves with their own {$w}",
    "{$1} drowns in soymilk...",
    "{$1}'s phone betrayed them...",
    "{$1} cut the wrong wire",
    "${1} took a {$w} right to the crotch"
];

var weapons = [
    "BFG",
    "Frying Pan",
    "Poring Wand",
    "Fooling Laser Gun",
    "Meatball",
    "I-like-you",
    "GPD (Giant Purple Dildo)",
    "Backscratcher"
];

function sendMsgs(msgs, delay, cb) {
    if (msgs.length < 1) {
        return cb;
    }
    var remain = msgs.slice(1);
    var sendRemain = sendMsgs.bind(null, remain, delay);
    message.channel.send(msgs[0]).then(function() {
        setTimeout(sendRemain, delay);
    });
}

class GachaBattleRoyale {
    constructor(){
        this.init();
    }

    init() {
        message = undefined;
        day = 0;
        CoreUtil.dateLog("Initialized Battle Royale Game! " + this.generateEntry());
    }

    generateEntry(message) {
        return {
            //daysSurvived: 0,
            numKills: 0,
            kills: [],
            killer: "",
            //survivor: false,
            dead: false
        };
    }

    rollDice() {
        return Math.floor(Math.random() * 100) + 1;
    }

    randomPhrase(phraseType) {
        var phrase = phraseType[Math.floor(Math.random()*phraseType.length)];
        return phrase;
    }

    randomEntry(entries) {
        let keys = Array.from(entries.keys());
        var entry = entries.get(keys[Math.floor(Math.random() * keys.length)]);

        return entry;
    }

    randomAlivePlayer(entries, dupe) {
        var found = false;

        console.log("Found: " + found);
        while(!found) {
            var entry = this.randomEntry(entries);
            console.log("Entry name: " + entry.member.displayName + " Entry Dead?: " + entry.entry.dead);
            if(dupe) {
                console.log("Dupe name: " + dupe.member.displayName);
            }
            if(!entry.entry.dead) {
                if(dupe && entry.member.displayName != dupe.member.displayName) {
                    found = true;
                    return entry;
                }
                found = true;
                return entry;
            }
        }
    }

    numAlive(entries) {
        var alive = 0;
        entries.forEach(function(value, key) {
            if(!value.entry.dead) {
                alive++;
            }
        });

        console.log("Num Alive: " + alive);

        return alive;
    }

    firstAlivePlayer(entries) {
        var winner = undefined;
        entries.forEach(function(value, key) {
            if(!value.entry.dead && winner === undefined) {
                winner = value;
            }
        });
        return winner;
    }

    startGame(msg) {
        message = msg;
        return this.startGameMessage();
    }

    entryToString(entry) {
        return entry.numKills;
    }

    processMessages(entries) {
        var winner = this.firstAlivePlayer(entries);
        console.log("Winner");
        console.log(winner);
        sendMsgs(messages, 3000, this.endGameMessage(winner.member.displayName, winner));
    }

    endGame(entries) {
        console.log("Ending Game!");
        entries.forEach(function(value, key) {
            console.log(key);
        });
        
        day++;
        this.sendNewDayMessage(entries);

        //Do Day 1
        this.doDayOne(entries);
        if(this.numAlive(entries) == 1) {
            this.processMessages(entries);
        }

        while(this.numAlive(entries) > 1) {
            day++;
            this.sendNewDayMessage(entries)
            this.doDayN(entries);
        }
        this.processMessages(entries);
        
        //return this.endGameMessage(winnerKey, winnerValue);
    }

    formatMessage(string, replacements) {
        let str = string;
        console.log(string);
        console.log(replacements);
        str = str.replace("{$1}", "**" + replacements.player1 + "**");
        str = str.replace("{$2}", "**" + replacements.player2 + "**");
        str = str.replace("{$3}", "**" + replacements.player3 + "**");
        str = str.replace("{$n}", "**" + replacements.number + "**");
        str = str.replace("{$w}", "**" + replacements.weapon + "**");
        console.log(string);
        return str;
    }

    doDayOne(entries) {
        this.doAnnihilation(entries);
        this.doMistake(entries);
        this.doPlayerKill(entries);
    }

    doDayN(entries) {
        var actions = Math.floor(Math.random() * 3) + 2;
        console.log("Doing Day " + day);
        console.log(actions);
        while(actions > 0) {
            var action = Math.floor(Math.random() * 10) + 1;
            console.log(action);
            if(action <= 1) {
                this.doAnnihilation(entries);
            } else if(action >= 5) {
                this.doPlayerKill(entries);
            } else {
                this.doMistake(entries);
            }
            actions--;
        }
    }

    doMistake(entries) {
        if(this.numAlive(entries) >= 2) {
            var target = this.randomAlivePlayer(entries);
            this.killPlayer(target, target);

            const embed = new Discord.RichEmbed();
            //embed.setTitle("__Battle Royale | **Annihilation!**__");
            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(mistakes), 
                    {
                        player1: target.member.displayName,
                        weapon: this.randomPhrase(weapons)
                    }
                )
            );
            embed.setColor("LUMINOUS_VIVID_PINK");
    
            messages.push({ embed: embed });
            //message.channel.send("", { embed: embed })
        }
    }

    doAnnihilation(entries) {
        const _this = this;

        var annihilatedStr = "";
        var killed = 0;
        
        entries.forEach(function(value, key) {
            var dies = Math.random() >= 0.7;
            if(dies && !value.entry.dead) {
                _this.killPlayer(value, god);
                annihilatedStr += ", " + key;
                killed++;
            }
        });

        const embed = new Discord.RichEmbed();
		embed.setTitle("__Battle Royale | **Annihilation!**__");
		embed.setDescription(
            this.formatMessage(
                this.randomPhrase(annihilations), 
                {number: killed, weapon: this.randomPhrase(weapons)}
            ) + "\n\n" + annihilatedStr.slice(2)
        );
        embed.setColor("RED");

        //message.channel.send("", { embed: embed })
        messages.push({ embed: embed });
    }

    doPlayerKill(entries) {
        if(this.numAlive(entries) >= 2) {
            var target = this.randomAlivePlayer(entries);
            var killer = this.randomAlivePlayer(entries, target);
            this.killPlayer(target, killer);
    
            const embed = new Discord.RichEmbed();
            //embed.setTitle("__Battle Royale | **Annihilation!**__");
            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(oneOnOneKills), 
                    {
                        player1: killer.member.displayName,
                        player2: target.member.displayName,
                        weapon: this.randomPhrase(weapons)
                    }
                )
            );
            embed.setColor("ORANGE");
    
            messages.push({ embed: embed });
            //message.channel.send("", { embed: embed })
        }
    }

    killPlayer(target, killer) {
        if(killer === god) {
            target.entry.killer = god;
        } else {
            target.entry.killer = killer.member.displayName;
            killer.entry.kills.push(target.member.displayName);
            killer.entry.numKills++;
        }
        
        target.entry.dead = true;
    }

    sendNewDayMessage(entries) {
        var newDayMsg = "It's the dawn of a new day!";
        var roster = undefined;

        if(day === 1) {
            newDayMsg = "Welcome to the first day of battle!";
        }
        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle Royale **Day " + day + "**__");
        embed.setDescription(newDayMsg);
        embed = this.addRosterEmbed(entries, embed);
        embed.setColor("AQUA");

        //setTimeout(function() {message.channel.send("", { embed: embed })}, 2000);

        messages.push({ embed: embed });
        //message.channel.send("", { embed: embed })
    }

    addRosterEmbed(entries, embed) {
        if(day === 1) {
            var entryString = "";
            entries.forEach(function(value, key) {
                //entryString += entryString.lenght > 0 ? ", " + key : key;
                entryString += ", " + key;
            });
            embed.addField("Starting Roster", entryString.slice(2));
        } else {
            var deadString = "";
            var aliveString = "";

            entries.forEach(function(value, key) {
                var killsStr = "";
                if(value.entry.numKills > 0) {
                    killsStr = " (" + value.entry.numKills + ")";
                }
                if(value.entry.dead) {
                    deadString += deadString.length > 0 ? "\n:skull: " + key + killsStr : ":skull: " + key + killsStr;
                } else {
                    aliveString += aliveString.length > 0 ? "\n:hearts: " + key + killsStr : ":hearts: " + key + killsStr;
                }
            });

            console.log(aliveString);
            console.log(deadString);

            embed.addField("Alive", aliveString, true);
		    embed.addField("Dead", deadString, true);
        }

        return embed;
    }

    sleepMilisconds(miliseconds) {
        var currentTime = new Date().getTime();
     
        while (currentTime + miliseconds >= new Date().getTime()) {
        }
     }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Battle Royale__`);
		embed.setDescription("Gacha Game Started! Join the battle and see if you have what it takes to win the Battle Royale!\n\n To enter type !gacha");
        embed.setFooter("Entry Example: !gacha");
        return embed;
    }

    endGameMessage(winnerName, winnerValue) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Battle Royale__`);
        embed.setDescription(winnerName + " won the battle against all odds!");
        if(winnerValue.entry && winnerValue.entry.numKills && winnerValue.entry.kills) {
            embed.addField(winnerValue.entry.numKills + " kills", winnerValue.entry.kills.join(", "));
        }
        if(winnerValue.member.user && winnerValue.member.user.avatarURL) {
            embed.setThumbnail(winnerValue.member.user.avatarURL);
        }
        embed.setColor("GOLD");
        messages.push({ embed: embed });
        //return embed;
    }

    //Service already sends entry as a toString
    entryMessage() {
        const message = "Entered the Arena!";
        return message;
    }
}

module.exports = GachaBattleRoyale