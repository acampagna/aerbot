const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
const User = mongoose.model('User');
const MemberUtil = require("../utils/MemberUtil.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const StoreItem = mongoose.model('StoreItem');
const StorePurchase = mongoose.model('StorePurchase');
const Validation = require("../utils/ValidationUtil.js");

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

serviceChannels = new Map();

accounts = new Map();

const wait = require('util').promisify(setTimeout);

class AccountService {

  constructor(){
    if(! AccountService.instance){
      this._data = [];
      AccountService.instance = this;
    }

    return AccountService.instance;
  }

  initialize() {

  }

  getAccounts() {
    return accounts || new Map();
  }

  setConsoleCodeChannel(channel) {
    serviceChannels.set("console", channel);
  }

  setPCCodeChannel(channel) {
    //PCCodeChannel = channel;
    serviceChannels.set("pc", channel);
  }

  setBotsChannel(channel) {
    serviceChannels.set("bots", channel);
  }

  setClient(client) {
    this.client = client;
  }

  setServer(server) {
    this.server = server;
  }

  getChannelByService(service) {
    switch(service.toLowerCase()) {
      case 'steam':
      case 'epic':
      case 'origin':
      case 'bnet':
      case 'battle.net':
      case 'league':
      case 'lol':
        return serviceChannels.get("pc");
        break;
      case 'playstation':
      case 'psn':
      case 'xbl':
      case 'xbox':
      case 'switch':
      case 'friendcode':
        return serviceChannels.get("console");
        break;
			default:
				return null;
    }
  }

  getPlatformByService(service) {
    switch(service.toLowerCase()) {
      case 'steam':
      case 'epic':
      case 'origin':
      case 'bnet':
      case 'battle.net':
      case 'league':
      case 'lol':
        return "PC";
      case 'playstation':
      case 'psn':
				return "PS4";
      case 'xbl':
      case 'xbox':
        return "Xbox";
      case 'switch':
      case 'friendcode':
        return "Switch";
			default:
				return "Unknown";
    }
  }

  addAccount(uid, service, account) {
    //console.log("Adding " + MemberUtil.getAccountNiceName(service) + " " + account);
    var nicename = MemberUtil.getAccountNiceName(service);

    accounts.set(nicename, accounts.has(nicename) ? accounts.get(nicename).set(uid,account) : new Map([[uid,account]]));
  }

  processUsersWithAccounts() {
    var _this = this;
    return new Promise(async function(resolve, reject) {
      User.findAllActiveUsersWithAccounts().then(users => {
        users.forEach(user => {
          user.accounts.forEach(function(value, key) {
            //console.log(key + " " + value);
            _this.addAccount(user.username, key, value);
          });
        });
        resolve();
      });
    });
  }

  async generateAccountLists(service, username) {
    var _this = this;
    await this.processUsersWithAccounts();

    if(username && accounts.has(service) && accounts.get(service).has(username)) {
      console.log("Deleted " + username);
      accounts.get(service).delete(username);
    }

    accounts.forEach(function(value, key) {
      if(key == "steam" || key == "xbox" || key == "psn" || key == "switch" || key == "epic" || key == "bnet" || service == "activision") {
        if(!service || key === service) {
          _this.sendAccountsMessage(key);
        }
      }
    });
  }

  async sendAccountsMessage(service) {
    console.log("---[" + service + "]---");
    var channel = this.getChannelByService(service);

    //console.log(channel);

    var serviceAccounts = accounts.get(service);

    //console.log(serviceAccounts);

    var msgStr = "__" + MemberUtil.getAccountDisplayName(service) + " Accounts__\n";
    /*if(service == "epic" || service == "steam" || service == "bnet" || service == "activision") {
      msgStr += "__" + MemberUtil.getAccountDisplayName(service) + " Accounts__\n";
    }*/

    /*serviceAccounts.forEach(function(value, key) {
      msgStr += "**" + key + "** : ";
      
      if(service == "steam") {
        msgStr += "<" + value + ">\n";
      } else {
        msgStr += value + "\n";
      }
    });*/

    msgStr += DiscordUtil.constructTableFromMap(serviceAccounts);

    msgStr += "\n*To add yourself to this list please use the !accounts command in " + serviceChannels.get("bots") + ". i.e.* `!accounts " + service + " " + serviceAccounts.values().next().value + "`\n";

    this.getAccountMessageForService(service).then(message => {
      console.log(service + " Message Exists! Editing");
      message.edit(msgStr);
    }).catch(err => {
      console.log(service + " Message doesn't Exist! Adding new message!");
      channel.send(msgStr).then(message => {
        Aerbot.set(this.getServiceMessageKey(service), message.id);
      });
    });

    console.log(serviceChannels.get("console").name);
  } 

  /*async getAccountMessagesForService(service) {
    var channel = this.getChannelByService(service);

    Aerbot.get("accounts_msgs_" + service).then(msgIds => {
      var msgsArr = msgIds.split(",");
      msgsArr.forEach(msg => {
        channel.fetchMessage(msg);
      });
    });
  }*/

  async getAccountMessageForService(service) {
    var _this = this;
    return new Promise(function(resolve, reject) {
      var channel = _this.getChannelByService(service);

      Aerbot.get(_this.getServiceMessageKey(service)).then(async msgIds => {
        if(msgIds) {
          channel.fetchMessage(msgIds.value).then(message => {
            resolve(message);
          }).catch(err => {
            console.log("Couldn't find message");
            reject();
            //console.log(err);
          });
        } else {
          reject();
        }
      });
    });
  }

  async doAccountMessagesExistForService(service) {
    Aerbot.get(this.getServiceMessageKey(service)).then(msgIds => {
      return (msgIds && msgIds.value.length > 0);
    });
  }

  getServiceMessageKey(service) {
    return "accounts_msgs_" + service;
  }
}
  
const instance = new AccountService();

module.exports = AccountService