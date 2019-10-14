const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');

const god = "Aerbot";
const gameName = "Battle Royale";
const msgSpeed = 4500;

var message = undefined;
var day = 0;
var todaysEvent = 0;
var todaysEventName = "";
var kidnapper = undefined;
var kidnappee = undefined;

var messages = [];

/*IDEAS
- Players stealing other player's weapons then dual wielding
- Attack values that go up based on kills and other stuff
- Zombie system. Players sometimes turn into zombies instead of die. They can turn others into zombies. Zombies can't win.
- Move all phrases, objects, etc into a database. Let people add them with a bot command
- Adding images to the battle to make them look better and more interesting
- Have a mode that forces everyone in the channel to participate in the battle
- 3 way fights
- Duels in the middle of battle. i.e. Showdowns.
- Possibly do Duels and 3 way fight as a fight for a dropbox
- Teams
- Yamina's T-Bagging Idea
- Adding an "almost killed" or "near kill" type of action
- Special Events System:
-- Resurrection so that a random person can get back into the battle
-- Blue Shell that takes out the player with the most kills
-- Stealing Weapons from other players
-- Finding weapons and armor to improve attack and hp for the final showdown
-- Finding special items to assist you in the final showdown
*/

/* **BATTLE ROYALE PATCH NOTES**
- Removed suicides (but not killing yourself. They're two different things actually....lol)
- Added more Durango-based combat messages
- More messages utilize the player's weapon to make their weapon choice more important
- Changes a lot of ratios for different actions and events happening. Most importantly, less suicides.
- Added !gatcha alias
- Added new item to the "Find Item" event, Immunity Talisman. The player is automatically get resurrected if they die while having this item. Does not resurrect during the showdown.
- Added Daily Events. Limited effects that last for the whole day. Every day has a new event.
-- Normal Day: Nothing special happens on this day
-- Mass Protection: A small number of players gain instant resurrection for the day
-- Vengeance: Players deal 20 damage to their killer when they're killed
-- Vampirism: Players gain 20 health when they kill someone 
-- Bloodbath: Only player killing happens on this day
-- Bloodlust: A small number of players 
-- Kidnapping: A player kidnaps another player. Both players are safe from harm today but stay tuned to the end of the day to see what happens!
*/

//Need to move all this to a configuration file
var players = [
    "Contestants",
    "Players"
]

var annihilations = [
    "zRed creates a stew out of {$n} of our tastiest combatants!",
    "An avalanche of {$w}s crushes {$n} players in the arena. Oh the horror!",
    "Thanos just snapped {$n} mortals out of existence",
    "A wild Electrode has appeared, It used Self-Destruct. {$n} contestants fainted...",
    "Natural selection kills {$n} smart, intelligent, and unique snowflakes",
    "A stampede of 1000 {$a} tramples {$n} brave pioneers",
    "{$n} fighters attended the Red Wedding"
];

var oneOnOneKills = [
    "{$1} eviscerates {$2} with their {$w}",
    "{$1} + {$w} = one dead {$2}!",
    "{$1} kills {$2} with a {$w}",
    "{$1} one-shots {$2} with a {$w}",
    //"{$1} was given a name: {$2}. The Red God is pleased.",
    "{$1} sticks {$2} with the pointy end of their {$w}",
    //"{$1} shows {$2} how they got their smile",
    //"{$1} drops a acme safe in {$2}",
    "{$1} covers {$2} in tuna and throws them into a pit of hungry kittens",
    "{$1} shoves a mayonnaise covered {$w} up {$2}'s ass and pulls the trigger",
    //"{$2} intelligently stuck their tongue on an icy pole and was killed by {$1}",
    //"{$1} drowns {$2} in the Dauntless Compy Pool",
    "{$1} sacrificed {$2} to a herd of wild {$a}"
];

var mistakes = [
    //"{$1} one-shot themselves",
    "{$1} killed themself with their own {$w}",
    //"{$1} drowns in soymilk...",
    "{$1}'s {$w} betrayed them...",
    "{$1} cut the wrong wire",
    "{$1} cut off their own {$b} with a {$w}",
    //"{$1} trips on their untied shoelace right into a pit of fire",
    "{$1} didn't actually want to win and turns their {$w} on themselves. Oh the humanity!",
    "{$1} decides to do the tide challenge and dies of regret, stupidity, and poison",
    //"{$1} steps onto a landmine and blows up into million pieces",
    //"{$1} yeeted themselves out of existence",
    "{$1} gets crushed by a {$a}",
    "{$1} gets their {$b} bitten off by a wild {$a}"
    //"{$1} dies waiting for savage islands to reopen"
];

var nearKills = [
    "{$1} attacks {$2} with their {$w} but {$2} narrowly escapes with {$hp} health",
    "{$1} takes aim at {$2} with their {$w} but an angelic Festival Elephantulus saves their life with {$hp} health remaining",
    "{$2} narrowly escapes an encounter with a wild {$a} with {$hp} health remaining"
];

var threeWayKill = [
    "{$1} and {$3} work together to cut off {$2}'s head",
    "{$1} and {$3} toss {$2} into a pack of wild {$a}"
];

var weapons = [
    "Frying Pan",
    //"Poring Wand",
    //"Fooling Laser Gun",
    "Meatball",
    //"I-like-you",
    "GPD (Giant Purple Dildo)",
    "Backscratcher",
    "Dirty Socks",
    //"cat-o-nine-tail",
    "Pickle",
    //"Seagull Bone Crossbow",
    //"Thorny Spine Hammer",
    //"Pet Direwolf",
    "$100 Bill",
    "Buster Sword",
    "Humerun Bat",
    "BFG 9000",
    "Gravity Gun",
    "Fire Flower",
    "Fatman and Little Boy",
    "Banana Peel",
    "Star Rod",
    "Master Sword"
];

var showdownHits = [
    "{$1} lands a hit to the {$b} with their {$w}",
    "{$1} does a roundhouse kick to {$2}'s {$b}",
    "{$1} dodges an attack then bites {$2}'s {$b}",
    "{$1} grazes {$2} in the {$b} with their {$w}",
    "{$1} throws boiling oil at {$2}",
    "{$1} spanks {$2} on the {$b}",
    "{$1} picks up a rock, hurling it at {$2} hitting them in the {$b}",
    "{$1} goes invisible, flanks {$2}, and attacks from behind with their {$w}",
    "{$1} throws a pack of {$a} at {$2}",
    //"{$1} tortures {$2} with death by 1000 cuts, then rubs them with salt and lemon juice",
    "A wild {$a} comes out of nowhere, charges at {$2}, and hits them right in the {$b}"
];

var showdownArenas = [
    "in Cypress' Dark Basement",
    "at the Kiki factory",
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
    "in BriarRose's Magical Library",
    "in Skye's Chamber of Horrors",
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
    "Claptrap"

]

var showdownMisses = [
    "{$1} parrys {$2}'s {$w} attack",
];

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
        messages = [];
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
            immune: false,
            dailyImmune: false,
            dead: false,
            zombie: false,
            zeal: false,
            disease: false,
            kidnapping: false,
            lusted: false,
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

    isPlayerImmune(entry) {
        return (entry.entry.immune || entry.entry.dailyImmune);
    }

    isValidTarget(target) {
        return (!target.entry.kidnapping && !target.entry.dead);
    }

    randomAlivePlayer(entries, dupe) {
        var found = false;
        //console.log("Getting Random Alive Players");
        while(!found) {
            var entry = this.randomEntry(entries);
            //console.log(entry.member.displayName + " Valid Target? " + this.isValidTarget(entry) + " Dead? " + entry.entry.dead + " Kidnapped? " + entry.entry.kidnapping);
            if(this.isValidTarget(entry)) {
                if(dupe) {
                    if(entry.member.displayName != dupe.member.displayName) {
                        found = true;
                        return entry;
                    }
                } else {
                    found = true;
                    return entry;
                }
            }
        }
    }

    randomLustedPlayer(entries) {
        var found = false;
        while(!found) {
            var entry = this.randomEntry(entries);
            if(this.isValidTarget(entry) && entry.entry.lusted) {
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

    randomXPlayers(entries, num) {
        entries.forEach(function(value, key) {
            
        });
    }

    numAlive(entries) {
        var alive = 0;
        entries.forEach(function(value, key) {
            if(!value.entry.dead) {
                alive++;
            }
        });

        return alive;
    }

    numTargets(entries) {
        const _this = this;

        var alive = 0;
        entries.forEach(function(value, key) {
            if(_this.isValidTarget(value)) {
                alive++;
            }
        });

        return alive;
    }

    playerHasXKills(entries, targetKills) {
        var topKills = 0;
        entries.forEach(function(value, key) {
            if(value.entry.numKills > topKills) {
                topKills = value.entry.numKills;
            }
        });

        console.log("Top Kills: " + alive);

        if(topKills >= targetKills) {
            return true;
        } else {
            return false;
        }
        
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
        const _this = this;
        var killLeader = undefined;
        var killLeaderKills = 0;
        entries.forEach(function(value, key) {
            if(_this.isValidTarget(value) && value.entry.numKills > killLeaderKills) {
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

        UserModel.findById(winner.member.id).exec()
        	.then(userData => {
                if(userData) {
                    userData.gachaWins++;
                    userData.brWins++;
                    console.log("BR Wins: " + userData.brWins);
                    userData.save();
                }
        });

        console.log("Winner");
        console.log(winner.entry);
        sendMsgs(messages, msgSpeed, this.endGameMessage(winner.member.displayName, winner));
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
            this.processMessages(entries);
        }

        /*day++;
        this.sendNewDayMessage(entries);*/
    
        while(this.numAlive(entries) > 2) {
            day++;
            this.sendNewDayMessage(entries);
            this.doDayN(entries);
        }

        day++;

        this.doShowdown(entries);

        this.processMessages(entries);
        
        //return this.endGameMessage(winnerKey, winnerValue);
    }

    formatMessage(string, replacements) {
        let str = string;
        //console.log(string);
        //console.log(replacements);
        //str = str.replace("{$1}", "**" + replacements.player1 + "**");
        //str = str.replace("{$2}", "**" + replacements.player2 + "**");
        //str = str.replace("{$3}", "**" + replacements.player3 + "**");

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
        //str = str.replace("'s", "**'s**");
        //console.log(string);
        return str;
    }

    doDayOne(entries) {
        console.log("---[DAY 1]---");
        //this.doNormalDay();
        this.doMassProtection(entries);

        if(this.numAlive(entries) > 10) {
            this.doAnnihilation(entries);

            this.doThreeWayKill(entries);

            this.doNearKill(entries);

        }
        //this.doMistake(entries);

        this.doPlayerKill(entries);

        this.doResurrect(this.randomDeadPlayer(entries));

        this.resolveDailyEvent(entries);
    }

    doDayN(entries) {
        var actions = Math.floor(Math.random() * (3+day/2)) + 1;

        console.log("---[DAY " + day + "]---");

        this.doDailyEvent(entries);
        var alive = this.numAlive(entries);

        console.log("Alive " + alive + " | Targets " + this.numTargets(entries) + " | Actions " + actions);

        while(actions > 0 && alive > 2) {
            if(todaysEventName === "Bloodbath") {
                var action = 99;
            } else {
                var action = Math.floor(Math.random() * 14) + 1;
            }

            console.log("Action: " + action);

            switch (action) {
                case 1:
                    this.doAnnihilation(entries);
                    break;
                case 2:
                case 3:
                    this.doNearKill(entries);
                    break;
                case 4:
                    this.doThreeWayKill(entries);
                    break;
                case 5:
                case 6:
                    this.doEvent(entries);
                    break;
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                    this.doPlayerKill(entries);
                    break;
                case 99:
                    this.doPlayerKill(entries);
                    break;
                default: 
                    this.doPlayerKill(entries);
            }
            
            alive = this.numAlive(entries);
            actions--;
        }

        this.resolveDailyEvent(entries);
    }

    doEvent(entries) {
        var action = Math.floor(Math.random() * 3) + 1;
        console.log("Event pick: " + action);
        var deadTarget = this.randomDeadPlayer(entries);
        console.log("Dead Target: " + deadTarget.member.displayName);

        switch (action) {
            case 1:
                this.doResurrect(deadTarget);
                break;
            case 2:
                if(this.numTargets(entries) > 0) {
                    this.doBlueShell(entries);
                } else {
                    this.doResurrect(deadTarget);
                }
                break;
            case 3:
                this.doFindPotion(entries);
                break;
            default: 
                this.doResurrect(deadTarget);
        }
    }

    doDailyEvent(entries) {
        var action = Math.floor(Math.random() * 6) + 1;

        if(action === 6 && this.numAlive < 5) {
            action = 3;
        }

        todaysEvent = action;

        console.log("Daily Event pick: " + action);

        switch (action) {
            case 1:
                this.doMassProtection(entries);
                break;
            case 2:
                this.doBloodbath();
                break;
            case 3:
                this.doNormalDay();
                break;
            case 4:
                this.doVampirism();
                break;
            case 5:
                this.doVengeance();
                break;
            case 6:
                this.doKidnapping(entries);
                break;
            case 7:
                this.doBloodlust();
                break;
            default: 
                this.doMassProtection(entries);
        }
    }

    resolveDailyEvent(entries) {
        console.log("Resolving Daily Event " + todaysEventName + "(" + todaysEvent + ")");

        switch (todaysEvent) {
            case 1:
                this.resolveMassProtection(entries);
                break;
            case 2:
                //this.resolveBloodbath(entries);
                break;
            case 3:
                //this.resolveNormalDay(entries);
                break;
            case 4:
                //this.resolveVampirism;
                break;
            case 5:
                //this.resolveVengeance();
                break;
            case 6:
                this.resolveKidnapping(entries);
                break;
            case 7:
                this.resolveBloodlust();
                break;
            default: 
                this.resolveMassProtection(entries);
        }

        todaysEvent = 0;
        todaysEventName = "";
    }

    doBloodlust() {
        todaysEventName = "Bloodlust";

        var numAffected = 0;
        var retStr = "";

        entries.forEach(function(value, key) {
            var affected = Math.random() >= 0.7;
            if(affected && !value.entry.dead) {
                value.entry.dailyImmune = true;
                retStr += ", " + key;
                numAffected++;
            }
        });

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("Some combatants become enraged and bloodthirsty granting them incredible killing power. Their loss of control makes it easy to hurt themselves though!\n\n");
        embed.setFooter("Bloodlusted players will be doing all the killing today but they will take damage everytime they kill.");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
        
        //randomLustedPlayer
    }

    resolveBloodlust() {
        entries.forEach(function(value, key) {
            value.entry.lusted = false;
        });
    }

    doVengeance() {
        todaysEventName = "Vengeance";

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("All combatants get a final hit on their enemy as they die dealing damage. You *will* have vengeance on this day!");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
    }

    doVampirism() {
        todaysEventName = "Vampirism";

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("All combatants are granted Lifesteal for the day allowing them to gain health from everyone they kill.");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
    }

    doBloodbath() {
        todaysEventName = "Bloodbath";

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("All hell breaks loose! Murder and Death is all that we'll see on this day!");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
    }

    doNormalDay() {
        todaysEventName = "Normal Day";

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("Nothing special happens on this day");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
    }

    doMassProtection(entries) {
        todaysEventName = "Mass Protection";
        var numAffected = 0;
        var retStr = "";

        entries.forEach(function(value, key) {
            var affected = Math.random() >= 0.85;
            if(affected && !value.entry.dead) {
                value.entry.dailyImmune = true;
                retStr += ", " + key;
                numAffected++;
            }
        });

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("The favor of the gods shines upon the battlefield as " + numAffected + 
            " combatants are granted immunity from death today.\n\n" + retStr.slice(2));
        embed.setFooter("*Immune players can take damage but can not be killed until the end of the day.*");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
    }

    resolveMassProtection(entries) {
        //Remove Daily Immunity
        entries.forEach(function(value, key) {
            value.entry.dailyImmune = false;
        });
    }

    doKidnapping(entries) {
        todaysEventName = "Kidnapping";
        kidnapper = this.randomAlivePlayer(entries);
        kidnappee = this.randomAlivePlayer(entries, kidnapper);

        console.log(kidnapper.member.displayName + " kidnaps " + kidnappee.member.displayName);

        kidnapper.entry.kidnapping = true;
        kidnappee.entry.kidnapping = true;

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setDescription("**" + kidnapper.member.displayName + "** has kidnapped **" + kidnappee.member.displayName + "**! Both are hidden and immune from attack today.");
        embed.setFooter("We'll find out the outcome of the kidnapping at the end of the day");
        embed.setColor(msgColors.dailyEvent);
        messages.push({ embed: embed });
    }

    resolveKidnapping(entries) {
        var action = Math.floor(Math.random() * 4) + 1;

        var alive = this.numAlive(entries);
        console.log("Kiddnapping Resolution pick: " + action + " | Number Alive: " + alive);

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Daily Event - " + todaysEventName + "__");
        embed.setColor(msgColors.dailyEvent);

        var kidnapperName = kidnapper.member.displayName;
        var kidnappeeName = kidnappee.member.displayName;

        var randomPhraseOpts = {
            player1: kidnapperName,
            player2: kidnappeeName,
            weapon: kidnapper.entry.weapon,
            bodyPart: this.randomPhrase(bodyParts),
            animal: this.randomPhrase(animals)
        };

        if(alive <= 3) {
            action = 1;
        }

        var damage = Math.floor(Math.random() * 10) + 11;

        switch (action) {
            case 1:
                embed.setDescription(
                    this.formatMessage(
                        "{$2} gets free after {$1} takes a bite out of {$2}'s {$b}", 
                        randomPhraseOpts
                    )
                );
                embed.setFooter(kidnapperName + " gains " + damage + " hp and " + kidnappeeName + " loses " + damage + " hp.");
                kidnappee.entry.hp -= damage;
                kidnapper.entry.hp += damage;
                break;
            case 2:
                embed.setDescription(
                    this.formatMessage(
                        "{$2} escapes from {$1} unscathed", 
                        randomPhraseOpts
                    )
                );
                break;
            case 3:
                embed.setDescription(
                    this.formatMessage(
                        "{$2} injures {$1}'s {$b} while escaping captivity", 
                        randomPhraseOpts
                    )
                );
                embed.setFooter(kidnapperName + " loses " + damage + " hp.");
                kidnapper.entry.hp -= damage;
                break;
            case 4:
                embed.setDescription(
                    this.formatMessage(
                        "{$2} tries to escape from {$1} but " + this.randomPhrase(oneOnOneKills), 
                        randomPhraseOpts
                    )
                );
                this.killPlayer(kidnappee, kidnapper);
                this.handleImmunity(kidnappee);
                break;
            default: 
                break;
        }

        kidnapper.entry.kidnapping = false;
        kidnappee.entry.kidnapping = false;

        kidnappee = undefined;
        kidnapper = undefined;

        messages.push({ embed: embed });
    }

    doResurrect(target, title) {
        if(!title || title === undefined) {
            title = "Event";
        }

        //var target = this.randomDeadPlayer(entries);

        target.entry.dead = false;
        target.entry.strength -= 2;
        target.entry.hp -= 15;

        var embed = new Discord.RichEmbed();
        embed.setTitle("__" + title + " - Resurrection__");
        embed.setDescription("The favor of the gods shine upon **" + target.member.displayName + "** as they are **resurrected** and welcomed back into the fight!");
        embed.setFooter("*Resurrected players are brought back to life with reduced health and damage*");
        //embed.setThumbnail("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZU_7EfPY7-cmtUAZaTK1N0qWC6ZGJpjKP-Hk_nHt5rASBeNbk");
        embed.setColor(msgColors.event);
        messages.push({ embed: embed });
    }

    doBlueShell(entries) {
        var target = this.getKillLeader(entries);
        this.killPlayer(target, target);

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Event - Blue Shell__");
        embed.setDescription("A flying blue shell comes zipping across the battlefield right towards **" + target.member.displayName + "**, a kill leader");
        embed.setColor(msgColors.event);
        messages.push({ embed: embed });

        this.handleImmunity(target);
    }

    doFindPotion(entries) {
        var target = this.randomAlivePlayer(entries);

        var action = Math.floor(Math.random() * 6) + 1;

        var potionName = "";
        var statBoosted = "";
        var statBoost = Math.floor(Math.random() * 4) + 1;
        var eventType = 0; //0 = Buff 1 = Item

        console.log("Item pick: " + action);

        switch (action) {
            case 1:
            case 2:
                potionName = "Vitality Potion";
                statBoosted = "hitpoints";
                statBoost = statBoost * 5;
                target.entry.hp += statBoost;
                break;
            case 3:
            case 4:
                potionName = "Strength Potion";
                statBoosted = "strength";
                statBoost = statBoost * 2;
                target.entry.strength += statBoost;
                break;
            case 5:
                potionName = "Elixer of the Gods";
                statBoosted = "strength & health";
                statBoost = statBoost * 4;
                target.entry.strength += statBoost;
                target.entry.hp += statBoost;
                break;
            case 6:
                eventType = 1;
                potionName = "Immunity Talisman";
                target.immune = true;
                break;
            default: 
        }

        //console.log(target);

        var embed = new Discord.RichEmbed();
        embed.setTitle("__Event - Find Item__");
        if(eventType === 0) {
            embed.setDescription("**" + target.member.displayName + 
            "** finds a **" + potionName + "**. They drink the potion and gain **" + 
            statBoost + " " + statBoosted + "**");
        } else {
            embed.setDescription("**" + target.member.displayName + 
            "** finds an **" + potionName + "**. They'll be immune from a single death.");
        }
        
        embed.setColor(msgColors.event);
        messages.push({ embed: embed });
    }

    doDuel(entries) {
        const _this = this;

        var annihilatedStr = "";
        var killed = 0;

        var alive = this.numAlive(entries);
        
        entries.forEach(function(value, key) {
            var dies = Math.random() >= 0.7;
            if(dies && !value.entry.dead && alive > 2) {
                _this.killPlayer(value, god);
                annihilatedStr += ", " + key;
                killed++;
                alive--;
            }
        });
    }

    doShowdown(entries) {
        var playersAlive = "";
        var player1;
        var player2;

        entries.forEach(function(value, key) {
            value.entry.immune = false;
            value.entry.dailyImmune = false;

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
        embed.setDescription("Welcome to the Showdown! Our final 2 combatants will fight to the death **" + this.randomPhrase(showdownArenas) + "**");
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
                        animal: this.randomPhrase(animals),
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

    handleImmunity(target) {
        if(this.isPlayerImmune(target)) {
            console.log(target.member.displayName + " is immune!");
            target.entry.immune = false;
            this.doResurrect(target, "Immunity");
        }
    }

    /*handleStatModKillMsg(embed) {
        if(todaysEventName === "Vampirism" || (todaysEventName === "Vengeance") {
            embed.setFooter();
        }
    }*/

    doMistake(entries) {
        if(this.numTargets(entries) > 0) {
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
                        bodyPart: this.randomPhrase(bodyParts),
                        animal: this.randomPhrase(animals)
                    }
                )
            );
            embed.setColor(msgColors.mistake);
    
            messages.push({ embed: embed });

            this.handleImmunity(target);
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
            if(dies && _this.isValidTarget(value) && alive > 2 && !_this.isPlayerImmune(value)) {
                _this.killPlayer(value, god);
                annihilatedStr += ", " + key;
                killed++;
                alive--;
            }
        });

        if(killed > 0) {
            const embed = new Discord.RichEmbed();
            embed.setTitle("__**Annihilation!**__");
            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(annihilations), 
                    {number: killed, weapon: this.randomPhrase(weapons), animal: this.randomPhrase(animals)}
                ) + "\n\n" + annihilatedStr.slice(2)
            );
            embed.setColor(msgColors.annihilation);

            messages.push({ embed: embed });
        }
    }

    doPlayerKill(entries) {
        if(this.numTargets(entries) > 1) {
            var target = this.randomAlivePlayer(entries);
            var killer = this.randomAlivePlayer(entries);
            this.killPlayer(target, killer);
    
            const embed = new Discord.RichEmbed();

            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(oneOnOneKills), 
                    {
                        player1: killer.member.displayName,
                        player2: target.member.displayName,
                        weapon: killer.entry.weapon,
                        bodyPart: this.randomPhrase(bodyParts),
                        animal: this.randomPhrase(animals)
                    }
                )
            );
            embed.setColor(msgColors.playerKill);

            if(todaysEventName === "Vampirism") {
                embed.setFooter(killer.member.displayName + " gained 20 hp from Vampirism");
            }
            if(todaysEventName === "Vengeance") {
                embed.setFooter(killer.member.displayName + " lost 20 hp from Vengeance");
            }
    
            messages.push({ embed: embed });

            this.handleImmunity(target);
            //message.channel.send("", { embed: embed })
        }
    }

    

    doThreeWayKill(entries) {
        if(this.numTargets(entries) > 2) {
            var target = this.randomAlivePlayer(entries);
            var killer = this.randomAlivePlayer(entries);
            var assistant = this.randomAlivePlayer(entries, killer);

            this.killPlayer(target, killer, assistant);
    
            const embed = new Discord.RichEmbed();

            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(threeWayKill), 
                    {
                        player1: killer.member.displayName,
                        player2: target.member.displayName,
                        player3: assistant.member.displayName,
                        weapon: killer.entry.weapon,
                        weapon2: assistant.entry.weapon,
                        bodyPart: this.randomPhrase(bodyParts),
                        animal: this.randomPhrase(animals)
                    }
                )
            );
            embed.setColor(msgColors.playerKill);

            if(todaysEventName === "Vampirism") {
                embed.setFooter(killer.member.displayName + " & " + assistant.member.displayName + " gained 20 hp from Vampirism");
            }
            if(todaysEventName === "Vengeance") {
                embed.setFooter(killer.member.displayName + " & " + assistant.member.displayName + " lost 20 hp from Vengeance");
            }
    
            messages.push({ embed: embed });

            this.handleImmunity(target);
            //message.channel.send("", { embed: embed })
        }
    }

    randomPlayerDamageAmount(factor) {
        if(!factor || factor === undefined) {
            factor = 1;
        }

        return (((Math.floor(Math.random() * 10) + 10) + 1) * factor);
    }

    doNearKill(entries) {
        if(this.numTargets > 1) {
            var target = this.randomAlivePlayer(entries);
            var killer = this.randomAlivePlayer(entries, target);
            var damage = Math.floor(Math.random() * 10) + 11;
            //this.killPlayer(target, killer);
    
            target.entry.hp -= damage;
            //target.entry.strength -= 3;
    
            const embed = new Discord.RichEmbed();
            //embed.setTitle("__Battle Royale | **Annihilation!**__");
            embed.setDescription(
                this.formatMessage(
                    this.randomPhrase(nearKills), 
                    {
                        player1: killer.member.displayName,
                        player2: target.member.displayName,
                        weapon: killer.entry.weapon,
                        hp: target.entry.hp,
                        bodyPart: this.randomPhrase(bodyParts),
                        animal: this.randomPhrase(animals)
                    }
                )
            );
    
            embed.setColor(msgColors.mistake);
    
            messages.push({ embed: embed });
        }
        
        //message.channel.send("", { embed: embed })
    }

    killPlayer(target, killer, assistant) {
        if(this.isPlayerImmune(target)) {
            //target.entry.immune = false;
        } else {
            if(killer === god) {
                target.entry.killer = god;
            } else {
                target.entry.killer = killer.member.displayName;
                killer.entry.kills.push(target.member.displayName);
                killer.entry.numKills++;
                if(todaysEventName === "Vampirism") {
                    killer.entry.hp += 20;
                }
                if(todaysEventName === "Vengeance") {
                    killer.entry.hp -= 20;
                }
                if(assistant){
                    assistant.entry.numKills++;
                    assistant.entry.kills.push(target.member.displayName);
                    if(todaysEventName === "Vampirism") {
                        assistant.entry.hp += 20;
                    }
                    if(todaysEventName === "Vengeance") {
                        assistant.entry.hp -= 20;
                    }
                }
            }
            target.entry.dead = true;
        }
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
        const _this = this;
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
                var immuneStr = "";
                if(value.entry.numKills > 0) {
                    killsStr = " (" + value.entry.numKills + ")";
                }
                if(_this.isPlayerImmune(value)) {
                    immuneStr = "*";
                }
                if(value.entry.dead) {
                    deadString += deadString.length > 0 ? "\n:skull: " + key + killsStr : ":skull: " + key + killsStr;
                    numDead++;
                } else {
                    aliveString += aliveString.length > 0 ? "\n:hearts: " + key + immuneStr + killsStr : ":hearts: " + key + killsStr;
                    numAlive++;
                }
            });

            //console.log(aliveString);
            //console.log(deadString);

            embed.addField("Alive *(" + numAlive + ")*", aliveString, true);
		    embed.addField("Dead *(" + numDead + ")*", deadString, true);
        }

        return embed;
    }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Battle Royale__`);
        embed.setDescription("Gacha Game Started! Join the battle and see if you have what it takes to win the Battle Royale!\n\n" +
            " To enter type !gacha <weapon>");
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