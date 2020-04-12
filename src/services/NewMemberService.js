const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
const User = mongoose.model('User');
const MemberUtil = require("../utils/MemberUtil.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const Validation = require("../utils/ValidationUtil.js");
const MessageQueueItem = mongoose.model('MessageQueueItem');

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

var server = undefined;
var newServerMembers = new Map();
var newMembers = new Map();
var welcomers = new Map();
var nonMemberChannel;
var publicChannel;
var welcomeReadmeChannel;

const wait = require('util').promisify(setTimeout);

class NewMemberService {

  constructor(){
    if(! NewMemberService.instance){
      this._data = [];
      NewMemberService.instance = this;
    }

    return NewMemberService.instance;
  }

  initialize() {

  }

  setServer(s) {
    server = s;
  }

  setNonMemberChannel(channelId) {
    nonMemberChannel = channelId;
  }

  setPublicChannel(channelId) {
    publicChannel = channelId;
  }

  setWelcomeReadmeChannel(channelId) {
    welcomeReadmeChannel = channelId;
  }

  getNewServerMembers() {
    return newServerMembers;
  }

  getNewMembers() {
    return newMembers;
  }

  getWelcomers() {
    return welcomers;
  }

  getNewServerMember(userId) {
    return newServerMembers.get(userId);
  }

  getNewMember(userId) {
    return newMembers.get(userId);
  }

  getWelcomer(userId) {
    return welcomers.get(userId);
  }

  userIsNewServerMember(userId) {
    return newServerMembers.has(userId);
  }

  userIsNewMember(userId) {
    return newMembers.has(userId);
  }

  userHasWelcomedRecently(userId) {
    return welcomers.has(userId);
  }

  newMemberExists() {
    console.log("newMembers.size() = " + newMembers.size + " | " + (newMembers.size > 0));
    return (newMembers.size > 0);
  }

  removeNewServerMember(userId) {
    console.log("REMOVE NEW SERVER MEMBER");
    if(this.userIsNewServerMember(userId)) {
      newServerMembers.delete(userId);
    }
  }

  setNewServerMember(userId, welcomeMessage) {
    console.log("SET NEW SERVER MEMBER");
    if(!this.userIsNewServerMember(userId)) {
      newServerMembers.set(userId, welcomeMessage);
      const _this = this;
      setTimeout(function() {_this.removeNewServerMember(userId);}, 600000);
    }
  }

  removeNewMember(userId) {
    console.log("REMOVE NEW MEMBER");
    if(this.userIsNewMember(userId)) {
      newMembers.delete(userId);
    }
  }

  setNewMember(userId, welcomeMessage) {
    console.log("SET NEW MEMBER");
    if(!this.userIsNewMember(userId)) {
      newMembers.set(userId, welcomeMessage);
      const _this = this;
      setTimeout(function() {_this.removeNewMember(userId);}, 600000);
    }
  }

  removeWelcomer(userId) {
    console.log("REMOVING WELCOMER");
    if(this.userHasWelcomedRecently(userId)) {
      welcomers.delete(userId);
    }
  }

  setWelcomer(userId) {
    console.log("SET WELCOMER");
    if(!this.userHasWelcomedRecently(userId)) {
      welcomers.set(userId, true);
      const _this = this;
      setTimeout(function() {_this.removeWelcomer(userId);}, 300000);
    }
  }

  userJoinsServer(member, client) {
    this.sendWelcomeToServerMessage(member, client);
  }

  userBecomesMember(member, group, client) {
    this.sendWelcomeMemberMessage(member, group, client);
  }

  userLeavesServer(member, client) {
    if(this.userIsNewServerMember(member.id)) {
      this.editWelcomeMessageUserLeft(this.getNewServerMember(member.id));
      this.removeNewServerMember(member.id);
    } 
    if(this.userIsNewMember(member.id)) {
      this.editWelcomeMessageUserLeft(this.getNewMember(member.id));
      this.removeNewMember(member.id);
    }
  }

  userJoinsGroup(member, group, client) {
    if(this.userIsNewMember(member.id) && group.public) {
      var message = this.getNewMember(member.id);
      var channel = client.channels.get(group.channelId);
      if(!message.content.includes(channel)) {
        message.edit(message.content + " " + channel);
      }
    }
  }

  userLeavesGroup(member, group, client) {
    if(this.userIsNewMember(member.id) && group.public) {
      var message = this.getNewMember(member.id);
      var channel = client.channels.get(group.channelId);
      if(message.content.includes(channel)) {
        message.edit(message.content.replace(channel,""));
      }
    }
  }

  editWelcomeMessageUserLeft(message) {
    message.edit(message.content.substring(0,60) + "...aaaaand they're gone!");
  }

  sendWelcomeToServerMessage(member, client) {
    client.channels.get(nonMemberChannel).send("Welcome " + member + " to the Dauntless Gaming Community! In order to gain access to the rest of our community you must "
    + "**read the " + client.channels.get(welcomeReadmeChannel) + " channel** and add yourself to some game and platforms groups.").then(msg => {
      this.setNewServerMember(member.id, msg);
      //console.log(newServerMembers);
    });
  }

  sendWelcomeMemberMessage(member, group, client) {
    client.channels.get(publicChannel).send("Welcome " + member + " to DGC and thank you for adding yourself to a group and becoming a Member! " 
    + "Please make sure you've read all of the " + client.channels.get(welcomeReadmeChannel) + " channel to get the most out of our community.\n\n**Groups Joined:** " + client.channels.get(group.channelId)).then(msg => {
      this.setNewMember(member.id, msg);
      //console.log(newMembers);
    });
  }
}
  
const instance = new NewMemberService();

module.exports = NewMemberService