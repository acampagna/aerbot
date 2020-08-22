'use strict';

//const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

class Better {
    constructor(member, user, bet, winner) {
        this.bet = bet;
        this.member = member; // Discord member
        this.user = user; // Aerbot user
        this.winner = winner;
    }

    toString() {
        return `${this.member.displayName} | bet: ${this.bet}`;
    }
}

module.exports = Fighter