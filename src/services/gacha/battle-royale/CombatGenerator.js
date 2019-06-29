/**
 * Combat Generator for Battle Royale.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 **/

var annihilations = [
    "Oh No! King Poring has crushed {$n} arena contestants!",
    "zRed creates a stew out of {$n} of our tastiest combatants!",
    "An avalanche of {$w}s crushes {$n} players in the arena. Oh the horror!",
    "Thanos just snapped {$n} mortals out of existence",
    "A wild Electrode has appeared, It used Self-Destruct. {$n} contestants fainted...",
    "Natural selection kills {$n} smart, intelligent, and unique fighters",
    "{$n} fighters attended zRed Wedding"
];

var action = [
    "eviscerates",
    "karate chops",
    "kills",
    "one-shots"
]




var oneOnOneKills = [
    "{$1} eviscerates {$2} with their {$w}",
    "{$1} karate chops {$2} right in the face!",
    "{$1} kills {$2} with a {$w}",
    "{$1} one-shots {$2} with a {$w}",
    "{$1} was given a name: {$2}. The Red God is pleased.",
    "{$1} sticks {$2} with the pointy end of their {$w}. The bastard would be proud!",
    //"{$1} shows {$2} how they got their smile",
    //"{$1} drops a acme safe in {$2}",
    "{$1} covers {$2} in tuna and throws them into a pit of hungry kittens",
    "{$1} shoves a mayonnaise covered {$w} up {$2}'s ass and pulls the trigger"
];

var mistakes = [
    //"{$1} one-shot themselves",
    "{$1} killed themself with their own {$w}",
    "{$1} drowns in soymilk...",
    "{$1}'s {$w} betrayed them...",
    "{$1} cut the wrong wire",
    "{$1} cut off their {$b} with a {$w}",
    //"{$1} trips on their untied shoelace right into a pit of fire",
    "{$1} didn't actually want to win and turns their {$w} on themselves. Oh the humanity!",
    //"{$1} decides to do the tide challenge and dies of regret, stupidity and poison",
    //"{$1} steps onto a landmine and blows up into million pieces"
];

var nearKills = [
    "{$1} attacks {$2} with their {$w} but {$2} narrowly escapes with {$hp} hp"
];

var threeWayKill = [
    "{$1} and {$3} work together to cut off {$2}'s head"
];

var weapons = [
    //"BFG",
    "Frying Pan",
    "Poring Wand",
    "Fooling Laser Gun",
    "Meatball",
    //"I-like-you",
    "GPD (Giant Purple Dildo)",
    "Backscratcher",
    "dirty socks",
    //"cat-o-nine-tail",
    "pickle"
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
    //"{$1} tortures {$2} with death by 1000 cuts, then rubs them with salt and lemon juice",
    //"{$1} curbstomps {$2} teeth",
    "{$2} asks {$1} to prom and is friendzoned"
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
    "taint",
    "heiny"
];

class CombatGenerator {
    
}

module.exports = CombatGenerator