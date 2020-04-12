const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
const User = mongoose.model('User');
const MemberUtil = require("../utils/MemberUtil.js");
const DiscordUtil = require("../utils/DiscordUtil.js");

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

server = undefined;
const wait = require('util').promisify(setTimeout);

class MemberFetchingService {

  constructor(){
    if(! MemberFetchingService.instance){
      this._data = [];
      MemberFetchingService.instance = this;
    }

    return MemberFetchingService.instance;
  }

  initialize() {

  }

  setClient(c) {
    client = c;
  }

  setServer(s) {
    server = s;
  }

  testFunc(role) {
    console.log(role);
  }

  getMembersInRole(role) {
    var list = server.roles.get(role.id).members.map(m=>m.user);
    console.log(list.length);
    //console.log(list);
    //return this.getUsersFromMembers(list);

    return list;
  }

  async getUsersFromMembers(membersList) {
    var list = await User.findInIds(membersList.map(m=>m.id));

    console.log(list.length);
    //console.log(list);

    return list;
  }

  /*getMemberNotInRole(role) {
    var list = server.roles.get(role.id).members.map(m=>m.user);
    console.log(list.length);
    //console.log(list);
    //return this.getUsersFromMembers(list);

    return list;
  }*/

  async getMembersInactiveSince(date) {
    var users = await User.findInactiveSince(date);
    console.log(users.length);
    //console.log(users.map(m=>m.username));
    return users;
  }

  async getMembersInactivePastNumDays(daysInactive) {
    var date = new Date();
    date.setDate( date.getDate() - daysInactive );

    var users = await this.getMembersInactiveSince(date);

    return users;
  }

  //Inactive = No activity past 7 days
  async getInactiveMembers() {
    var date = new Date();
    date.setDate( date.getDate() - 7);

    var users = await this.getMembersInactiveSince(date);

    return users;
  }

  async getMembersBelowLevel(level) {
    var users = await User.findAllUsersBelowLevel(level);
    console.log(users.length);
    //console.log(users.map(m=>m.username));

    return users;
  }
}
  
const instance = new MemberFetchingService();

module.exports = MemberFetchingService