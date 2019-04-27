const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

const god = "Aerbot";
var message = undefined;
var day = 0;
var normalSleepTime = 1000;
var daySleepTime = 2000;

//Need to move all this to a configuration file
var players = [
    "Contestants",
    "Players"
]

var annihilations = [
    "Some catastrophe happened!",
    "A cataclysm engulfs {$n} of the contestants!",
    "A tempest zaps {$n} of our finest players!"
];

var oneOnOneKills = [
    "{$1} does something bad to {$2}",
    "{$1} shoots {$2} right in the face!",
    "{$1} kills {$2} with their {$w}!"
];

var mistakes = [
    "{$1} falls off a cliff",
    "{$1} kills themselves with their own {$w}",
    "Soymilk eats {$1}..."
]

var weapons = [
    "Spoon",
    "Fork",
    "Gun",
    "Knife"
]

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
        entries.forEach(function(value, key) {
            if(!value.entry.dead) {
                return value;
            }
        });
    }

    startGame(msg) {
        message = msg;
        return this.startGameMessage();
    }

    entryToString(entry) {
        return entry.numKills;
    }

    endGame(entries) {
        console.log("Ending Game!");
        entries.forEach(function(value, key) {
            console.log(key);
        });
        
        day++;
        this.sendNewDayMessage(entries);

        this.doDayOne(entries);
        if(this.numAlive(entries) == 1) {
            var winner = this.firstAlivePlayer(entries);
            return this.endGameMessage(winner.member.displayName, winner);
        }
        day++;
        this.sendNewDayMessage(entries);
        this.sleepMilisconds(daySleepTime);
        this.doDayTwo(entries);
        if(this.numAlive(entries) == 1) {
            var winner = this.firstAlivePlayer(entries);
            return this.endGameMessage(winner.member.displayName, winner);
        }
        day++;
        this.sendNewDayMessage(entries);
        this.sleepMilisconds(daySleepTime);
        this.doDayTwo(entries);
        if(this.numAlive(entries) == 1) {
            var winner = this.firstAlivePlayer(entries);
            return this.endGameMessage(winner.member.displayName, winner);
        }

        return this.endGameMessage(winnerKey, winnerValue);
    }

    formatMessage(string, replacements) {
        let str = string;
        console.log(string);
        console.log(replacements);
        str = str.replace("{$1}", replacements.player1);
        str = str.replace("{$2}", replacements.player2);
        str = str.replace("{$3}", replacements.player3);
        str = str.replace("{$n}", replacements.number);
        str = str.replace("{$w}", replacements.weapon);
        console.log(string);
        return str;
    }

    doDayOne(entries) {
        this.doAnnihilation(entries);
        entries.forEach(function(value, key) {
            console.log(key);
            console.log(value.entry);
        });
        this.sleepMilisconds(normalSleepTime);
        this.doMistake(entries);
        this.sleepMilisconds(normalSleepTime);
        this.doPlayerKill(entries);
        this.sleepMilisconds(normalSleepTime);
    }

    doDayTwo(entries) {
        entries.forEach(function(value, key) {
            console.log(key);
            console.log(value.entry);
        });
        this.doMistake(entries);
        this.sleepMilisconds(normalSleepTime);
        this.doPlayerKill(entries);
        this.sleepMilisconds(normalSleepTime);
        this.doPlayerKill(entries);
        this.sleepMilisconds(normalSleepTime);
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
    
            message.channel.send("", { embed: embed })
        }
    }

    doAnnihilation(entries) {
        const _this = this;

        var annihilatedStr = "";
        var killed = 0;
        
        entries.forEach(function(value, key) {
            var dies = Math.random() >= 0.3;
            if(dies) {
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
                {number: killed}
            ) + "\n\n" + annihilatedStr.slice(2)
        );
        embed.setColor("RED");

        message.channel.send("", { embed: embed })
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
    
            message.channel.send("", { embed: embed })
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

        message.channel.send("", { embed: embed });
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
                if(value.entry.dead) {
                    deadString += deadString.length > 0 ? "\n" + key : key;
                } else {
                    aliveString += aliveString.length > 0 ? "\n" + key : key;
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
        embed.setFooter("BATTLE ROYALE BETA UNDER CONSTRUCTION!");
        //embed.setThumbnail(winnerValue.member.user.avatarURL);
        return embed;
    }

    //Service already sends entry as a toString
    entryMessage() {
        const message = "Entered the Arena!";
        return message;
    }
}

module.exports = GachaBattleRoyale