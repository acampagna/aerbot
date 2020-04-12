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

server = undefined;
const wait = require('util').promisify(setTimeout);

class MessageQueueService {

  constructor(){
    if(! MessageQueueService.instance){
      this._data = [];
      MessageQueueService.instance = this;
    }

    return MessageQueueService.instance;
  }

  initialize() {

  }

  setClient(c) {
    client = c;
  }

  setServer(s) {
    server = s;
  }

  async addMessage(memberId, message) {
    var recentMessageSent = await MessageQueueItem.messageSentRecentlyToUser(memberId);
    var user = await User.byId(memberId);

    console.log(recentMessageSent);
    console.log(user.unsubscribed);

    if(!recentMessageSent && !user.unsubscribed) {
      MessageQueueItem.addMessage(memberId, "manual", message);
      return true;
    } else {
      return false;
    }
  }

  async sendNextMessageTo(memberId) {
    var recentMessageSent = await MessageQueueItem.messageSentRecentlyToUser(memberId);
    var user = await User.byId(memberId);
    var nextMessage = await MessageQueueItem.getNextMessageForUser(memberId);
    

    if(!recentMessageSent && !user.unsubscribed && nextMessage) {
      nextMessage.sent = true;
      nextMessage.sentDate = new Date();
      nextMessage.save();

      console.log(nextMessage);
      
      var member = server.members.get(memberId);

      var message = "Hello, **" + member.displayName + "**! You have a new message from the __Dauntless Gaming Community__.\n\n" + nextMessage.message + "\n\n*You may use the ❌ reaction below to unsubscribe from all future automated messages from DGC*";

      member.send(message).then(msg => {
        msg.react("❌");
      });

      return true;
    } else {
      return false;
    }
  }

  async sendNextMessage() {
    var nextMessage = await MessageQueueItem.getNextMessage();

    if(nextMessage) {
      console.log(nextMessage);
      var user = await User.byId(nextMessage.userId);
      var recentMessageSent = await MessageQueueItem.messageSentRecentlyToUser(nextMessage.userId);
  
      nextMessage.sent = true;
      nextMessage.sentDate = new Date();
      nextMessage.save();
  
      if(!recentMessageSent && !user.unsubscribed && nextMessage) {
        console.log(nextMessage);
        
        var member = server.members.get(nextMessage.userId);
  
        //var message = "Hello, **" + member.displayName + "**! You have a new message from the __Dauntless Gaming Community__.\n\n" + nextMessage.message + "\n\n*Automated messages are only sent to inactive members once every few weeks. You may use the ❌ reaction below to unsubscribe from all future automated messages.*";
        var message = nextMessage.message + "\n\n*Automated messages are only sent to inactive members once every few weeks. You may use the ❌ reaction below to unsubscribe from all future automated messages.*";
  
        member.send(message).then(msg => {
          console.log("Message Length: " + msg.content.length);
          msg.react("❌");
        });
  
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
  
const instance = new MessageQueueService();

module.exports = MessageQueueService