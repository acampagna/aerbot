const Discord = require("discord.js");
const mongoose = require('mongoose');
const Guild = mongoose.model('Guild');


/**
 * Service to manage Guilds. Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

class GuildService {
    constructor(){
     if(! GuildService.instance){
       this._data = [];
       GuildService.instance = this;
     }
  
     return GuildService.instance;
    }

    sendWelcomeMessage(member){
        //member.send("Welcome to the Dauntless gaming server! Please read the `welcome-readme` channel at the top of our Discord server. It will explain everything you need to get started in Dauntless!");
        
        var sentMsg = member.send("Welcome to the Dauntless gaming server! Please tell me what game your clan is in using the `!guild join` command. Choose from the following options:");
        setMsg += listGUilds() + "\n\nFor example, if you're playing Durango then type `!guild join Durango`";
    }

    listGuilds() {
        var retStr = "";
        Guild.findAllGuilds().then(guilds => {
            guilds.forEach(guild => {
                //embed.addField(group.name, group.numMembers + " members", true);
                retStr = retStr + guild.name + "\n";
            });
            embed.setDescription(retStr);
            //embed.setFooter("Use the !group command to join a group");
            resolve ({embed});
        });
    }
}

const instance = new GuildService();

module.exports = GuildService