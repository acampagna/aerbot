'use strict';

//const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

class Fighter {
    constructor(member, user, weapon) {
        this.name = member.displayName;
        this.numKills = 0;
        this.hp = 100;
        this.killer = undefined;
        this.strength = 15;
        this.weapon = weapon;
        this.member = member; // Discord member
        this.user = user; // Aerbot user
        this.dead = false;
    }

    takeDamage(damage) {
        console.debug(`${this.toString()} took ${damage} damage`);
        this.hp -= damage;

        if(this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    gainHP(hp) {
        console.debug(`${this.toString()} gained ${hp} hp`);
        this.hp += hp;
    }

    gainStr(str) {
        console.debug(`${this.toString()} gained ${str} Str`);
        this.strength += str;
    }

    loseStr(str) {
        console.debug(`${this.toString()} lost ${str} Str`);
        this.strength -= str;
    }

    die() {
        console.debug(`${this.toString()} has died`);
        this.dead = true;
    }

    resurrect() {
        console.debug(`${this.toString()} has resurrected`);
        this.dead = false;
    }

    setBetMessageId(id) {
        this.betMsgId = id;
    }

    getBetMessageId() {
        return this.betMsgId;
    }

    toString() {
        return `${this.name} | hp: ${this.hp}`;
    }

    getEmbed() {
        var embed = new Discord.RichEmbed();
        embed.setTitle(`__${this.name} the ${this.user.title}__`);

        embed.setDescription("Use the reactions on this message to bet on " + this.name + " winning the fight!");

        embed.addField(this.name + "'s HP", this.hp);
        embed.addField(this.name + "'s Strength", this.strength);
        embed.addField(this.name + "'s Weapon", this.weapon);

        if(this.user && this.user.embedColor)
            embed.setColor(this.user.embedColor);

        if(this.member && this.member.user && this.member.user.avatarURL) 
            embed.setThumbnail(this.member.user.avatarURL);
        
        return embed;
    }
}

module.exports = Fighter