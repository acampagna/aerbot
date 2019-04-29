const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

const god = "Aerbot";
const gameName = "Battle Royale";

var message = undefined;
var day = 0;

var messages = [];

/*IDEAS
- Players stealing other player's weapons then dual wielding
- Attack values that go up based on kills and other stuff
- Zombie system. Players sometimes turn into zombies instead of die. They can turn others into zombies. Zombies can't win.
- Move all phrases, objects, etc into a database. Let people add them with a bot command
- Adding images to the battle to make them look better and more interesting
- Have a mode that forces everyone in the channel to participate in the battle
- Special Events System:
-- Resurrection so that a random person can get back into the battle
-- Blue Shell that takes out the player with the most kills
-- Stealing Weapons from other players
-- Finding weapons and armor to improve attack and hp for the final showdown
-- Finding special items to assist you in the final showdown
*/


//Need to move all this to a configuration file
var players = [
    "Contestants",
    "Players"
]

var annihilations = [
    "Oh No! King Poring has crushed {$n} arena contestants!",
    "zRed creates a stew out of {$n} of our tastiest combatants!",
    "An avalanche of {$w}s crushes {$n} players in the arena. Oh the horror!",
    "Thanos just snapped {$n} mortals out of existence",
    "A wild Electrode has appeared, It used Self-Destruct. {$n} contestants fainted...",
    "Natural selection kills {$n} smart, intelligent, and unique fighters",
    "{$n} fighters attended zRed Wedding"
];

var oneOnOneKills = [
    "{$1} eviscerates {$2} with their {$w}",
    "{$1} karate chops {$2} right in the face!",
    "{$1} kills {$2} with a {$w}",
    "{$1} one-shots {$2} with a {$w}",
    "{$1} was given a name: {$2}. The Red God is pleased.",
    "{$1} sticks {$2} with the pointy end of their {$w}. The bastard would be proud!",
    "{$1} shows {$2} how they got their smile",
    "{$1} drops a acme safe in {$2}",
    "{$1} covers {$2} in tuna and throws them into a pit of hungry kittens",
    "{$1} shoves a mayonnaise covered {$w} up {$2}'s ass and pulls the trigger"
];

var mistakes = [
    "{$1} one-shot themselves",
    "{$1} killed themself with their own {$w}",
    "{$1} drowns in soymilk...",
    "{$1}'s {$w} betrayed them...",
    "{$1} cut the wrong wire",
    "{$1} cut off their {$b} with a {$w}",
    "{$1} trips on their untied shoelace right into a pit of fire",
    "{$1} didn't actually want to win and cuts their own throat",
    "{$1} decides to do the tide challenge and dies of regret, stupidity and poison",
    "{$1} steps onto a landmine while and blows up into million pieces"
];

var weapons = [
    "BFG",
    "Frying Pan",
    "Poring Wand",
    "Fooling Laser Gun",
    "Meatball",
    "I-like-you",
    "GPD (Giant Purple Dildo)",
    "Backscratcher",
    "dirty socks",
    "cat-o-nine-tail",
    "pickle"
];

var showdownHits = [
    "{$1} lands a hit to the {$b} with their {$w}",
    "{$1} does a roundhouse kick to {$2}'s {$b}",
    "{$1} dodges an attack then bites {$2}'s {$b}",
    "{$1} grazes {$2} in the {$b} with their {$w}",
    "{$1} throws boiling oil at {$2}",
    "{$1} spanks {$2} on the heiny",
    "{$1} picks up a rock, hurling it at {$2} hitting them in the {$b}",
    "{$1} goes invisible, flanks {$2}, and attacks from behind with their {$w}",
    "{$1} tortures {$2} with death by 1000 cuts, then rubs them with salt and lemon juice",
    "{$1} asks {$2} to prom and is friendzoned",
    "{$1} curbstomps {$2} teeth"
];

var showdownArenas = [
    "in a cave",
    "in a cold and dark basement",
    "on a mountain top",
    "at the soymilk factory",
    "in Aerfalle's closet",
    "in Deathsfew's sex dungeon",
    "on top of Mt. Doom",
    "Iiiinnnn Spaaaacceee"
];

var bodyParts = [
    "crotch",
    "head",
    "eye",
    "finger",
    "chest",
    "leg",
    "ass",
    "baby toe",
    "nipple",
    "taint"
];

var showdownMisses = [
    "{$1} parrys {$2}'s {$w} attack",
];

var msgColors = {
    showdownDay: "PURPLE",
    showdownAction: "RANDOM",
    mistake: "LUMINOUS_VIVID_PINK",
    annihilation: "ORANGE",
    playerKill: "RED",
    newDay: "AQUA",
    endGame: "BLUE",
    event: "GOLD"
};

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

    generateEntry(message, params) {
        var weapon = this.randomPhrase(weapons);
        if(params) {
            var paramsStr = params.join(" ");
            if(paramsStr && paramsStr.length > 1) {
                weapon = paramsStr;
            }
        }
        
        return {
            numKills: 0,
            kills: [],
            killer: "",
            dead: false,
            zombie: false,
            hp: 100,
            attack: 25,
            strength: 15,
            favor: 0,
            weapon: weapon
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

    randomAlivePlayer(entries) {
        var found = false;
        while(!found) {
            var entry = this.randomEntry(entries);
            if(!entry.entry.dead) {
                /*if(dupe && entry.member.displayName != dupe.member.displayName) {
                    found = true;
                    return entry;
                }*/
                found = true;
                return entry;
            }
        }
    }

    randomDeadPlayer(entries) {
        var found = false;
        while(!found) {
            var entry = this.randomEntry(entries);
            if(entry.entry.dead) {
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

    getKillLeader(entries) {
        var killLeader = undefined;
        var killLeaderKills = 0;
        entries.forEach(function(value, key) {
            if(value.entry.numKills > killLeaderKills) {
                killLeader = value;
                killLeaderKills = value.entry.numKills;
            }
        });
        return killLeader;
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
        sendMsgs(messages, 4000, this.endGameMessage(winner.member.displayName, winner));
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

        while(this.numAlive(entries) > 2) {
            day++;
            this.sendNewDayMessage(entries)
            this.doDayN(entries);
        }

        this.doShowdown(entries);

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
        str = str.replace("{$b}", "**" + replacements.bodyPart + "**");
        str = str.replace("{$d}", "**" + replacements.damage + "**");
        str = str.replace("'s", "**'s**");
        console.log(string);
        return str;
    }

    doDayOne(entries) {
        this.doAnnihilation(entries);
        this.doMistake(entries);
        this.doPlayerKill(entries);
        this.doEvent(entries);
    }

    doDayN(entries) {
        var actions = Math.floor(Math.random() * 3) + 2;
        var alive = this.numAlive(entries);
        console.log("Day " + day + " | Alive " + alive);

        while(actions > 0 && alive > 2) {
            var action = Math.floor(Math.random() * 10) + 1;
            console.log("Action pick: " + action);

            switch (action) {
                case 1:
                    this.doAnnihilation(entries);
                case 2:
                case 3:
                case 4:
                    this.doMistake(entries);
                    break; 
                case 5:
                    /*this.doEvent(entries);
                    break;*/
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    this.doPlayerKill(entries);
                    break;
                default: 
                    this.doPlayerKill(entries);
            }
            
            alive = this.numAlive(entries);
            actions--;
        }
    }

    doEvent(entries) {
        var action = Math.floor(Math.random() * 1) + 1;
        var target = this.randomAlivePlayer(entries);

        console.log("Event pick: " + action);

        switch (action) {
            case 1:
                this.doResurrect(entries);
                break;
            case 2:
                this.doFindPotion(target);
                break;
            case 3:
                this.doBlueShell(entries);
                break;
            default: 
                this.doResurrect(entries);
        }
    }

    doResurrect(entries) {
        var target = this.randomDeadPlayer(entries);
        target.entry.dead = false;
        target.entry.strength -= 3;
        target.entry.hp -= 20;

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle Royale - Event__");
        embed.setDescription("The favor of the gods shine upon **" + target.member.displayName + "** as they are **resurrected** and welcome back into the fight!");
        embed.setFooter("*Resurrected players are brought back to life with reduced health and damage*");
        //embed.setThumbnail("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZU_7EfPY7-cmtUAZaTK1N0qWC6ZGJpjKP-Hk_nHt5rASBeNbk");
        embed.setColor(msgColors.event);
        messages.push({ embed: embed });
    }

    doBlueShell(entries) {
        var target = this.getKillLeader(entries);
        this.killPlayer(target, target);

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle Royale - Event__");
        embed.setDescription("A flying blue shell comes zipping across the battlefield right towards " + target.member.displayName + ", the kill leader");
        embed.setColor(msgColors.event);
        messages.push({ embed: embed });
    }

    doFindPotion(target) {
        var action = Math.floor(Math.random() * 3) + 1;

        var potionName = "";
        var statBoosted = "";
        var statBoost = Math.floor(Math.random() * 4) + 1;

        console.log("Item pick: " + action);

        switch (action) {
            case 1:
                potionName = "Vitality Potion";
                statBoosted = "hitpoints";
                statBoost = statBoost * 5;
                target.entry.hp += statBoost;
                break;
            case 2:
                potionName = "Strength Potion";
                statBoosted = "strength";
                statBoost = statBoost * 2;
                target.entry.strength += statBoost;
                break;
            default: 
        }

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle Royale - Event__");
        embed.setDescription("A turtle fisherman flies in on a cloud and gives **" + target.member.displayName + 
            "** a **" + potionName + "**.**" + target.member.displayName + "** drinks the potion and gains **" + 
            statBoost + " " + statBoosted + "**");
        embed.setColor(msgColors.event);
        messages.push({ embed: embed });
    }

    doShowdown(entries) {
        var playersAlive = "";
        var player1;
        var player2;

        entries.forEach(function(value, key) {
            var killsStr = "";
            if(value.entry.numKills > 0) {
                killsStr = " (" + value.entry.numKills + ")";
            }
            if(!value.entry.dead) {
                if(player1) {
                    player2 = value;
                    playersAlive += " vs " + key + killsStr;
                } else {
                    player1 = value;
                    playersAlive += key + killsStr;
                }
            }
        });
        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle Royale **Day " + day + "** - The Showdown__");
        embed.setDescription("Welcome to the Showdown! Our final 2 combatants will fight to the death " + this.randomPhrase(showdownArenas));
        embed.setFooter(playersAlive);
        embed.setColor(msgColors.showdownDay);
        messages.push({ embed: embed });

        while(player1.entry.hp > 0 && player2.entry.hp > 0) {
            console.log(player1.member.displayName + " Health", player1.entry.hp + " | " + player2.member.displayName + " Health", player2.entry.hp);
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

            var attackValue = Math.floor(Math.random() * killer.entry.attack) + killer.entry.strength;

            this.damagePlayer(target, attackValue);

            const embed = new Discord.RichEmbed();

            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(showdownHits), 
                    {
                        player1: killer.member.displayName,
                        player2: target.member.displayName,
                        weapon: killer.entry.weapon,
                        bodyPart: this.randomPhrase(bodyParts),
                        damage: attackValue
                    }
                ) + " for **" + attackValue + "** damage!"
            );

            embed.addField(player1.member.displayName + " Health", player1.entry.hp, true);
            embed.addField(player2.member.displayName + " Health", player2.entry.hp, true);
            embed.setColor(msgColors.showdownAction);
    
            messages.push({ embed: embed });
        }

        if(player1.entry.hp > player2.entry.hp) {
            this.killPlayer(player2, player1);
        } else {
            this.killPlayer(player1, player2);
        }
    }

    damagePlayer(player, atk) {
        var hp = player.entry.hp - atk;
        if(hp < 0) {
            hp = 0;
        }
        player.entry.hp = hp;
        console.log(player.member.displayName + " lost " + atk + " health. Total hp: " + player.entry.hp);
    }

    doMistake(entries) {
        if(this.numAlive(entries) > 2) {
            var target = this.randomAlivePlayer(entries);
            this.killPlayer(target, target);

            const embed = new Discord.RichEmbed();
            //embed.setTitle("__Battle Royale | **Annihilation!**__");
            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(mistakes), 
                    {
                        player1: target.member.displayName,
                        weapon: target.entry.weapon,
                        bodyPart: this.randomPhrase(bodyParts)
                    }
                )
            );
            embed.setColor(msgColors.mistake);
    
            messages.push({ embed: embed });
            //message.channel.send("", { embed: embed })
        }
    }

    doAnnihilation(entries) {
        const _this = this;

        var annihilatedStr = "";
        var killed = 0;

        var alive = this.numAlive(entries);
        
        entries.forEach(function(value, key) {
            var dies = Math.random() >= 0.8;
            if(dies && !value.entry.dead && alive > 2) {
                _this.killPlayer(value, god);
                annihilatedStr += ", " + key;
                killed++;
                alive--;
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
        embed.setColor(msgColors.annihilation);

        //message.channel.send("", { embed: embed })
        messages.push({ embed: embed });
    }

    doPlayerKill(entries) {
        if(this.numAlive(entries) > 2) {
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
                        weapon: killer.entry.weapon
                    }
                )
            );
            embed.setColor(msgColors.playerKill);
    
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
            newDayMsg = "Welcome to the first day of battle. LET THE BATTLE BEGIN!";
        }
        var embed = new Discord.RichEmbed();
        embed.setTitle("__Battle Royale **Day " + day + "**__");
        embed.setDescription(newDayMsg);
        embed = this.addRosterEmbed(entries, embed);
        embed.setColor(msgColors.newDay);

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
            var numDead = 0;
            var numAlive = 0;

            entries.forEach(function(value, key) {
                var killsStr = "";
                if(value.entry.numKills > 0) {
                    killsStr = " (" + value.entry.numKills + ")";
                }
                if(value.entry.dead) {
                    deadString += deadString.length > 0 ? "\n:skull: " + key + killsStr : ":skull: " + key + killsStr;
                    numDead++;
                } else {
                    aliveString += aliveString.length > 0 ? "\n:hearts: " + key + killsStr : ":hearts: " + key + killsStr;
                    numAlive++;
                }
            });

            console.log(aliveString);
            console.log(deadString);

            embed.addField("Alive *(" + numAlive + ")*", aliveString, true);
		    embed.addField("Dead *(" + numDead + ")*", deadString, true);
        }

        return embed;
    }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Battle Royale__`);
		embed.setDescription("Gacha Game Started! Join the battle and see if you have what it takes to win the Battle Royale!\n\n To enter type !gacha <weapon>");
        embed.setFooter("Entry Example: !gacha battle axe");
        return embed;
    }

    endGameMessage(winnerName, winnerValue) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Battle Royale__`);
        embed.setDescription("**" + winnerName + "** and their **" + winnerValue.entry.weapon + "** won the battle against all odds!");
        if(winnerValue.entry && winnerValue.entry.numKills && winnerValue.entry.kills) {
            embed.addField(winnerValue.entry.numKills + " kills", winnerValue.entry.kills.join(", "));
        }

        if(winnerValue.member.user && winnerValue.member.user.avatarURL) {
            embed.setThumbnail(winnerValue.member.user.avatarURL);
        }
        embed.setColor(msgColors.endGame);
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