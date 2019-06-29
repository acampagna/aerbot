const CoreUtil = require("./utils/Util.js");
const Camo = require("camo");
const CronJob = require("cron").CronJob;
const Discord = require("discord.js");
const HandleServerMessage = require("./HandleServerMessage");
const InternalConfig = require("./internal-config.json");
const RequireAll = require("require-all");
const Mongoose = require('mongoose');

let dbc;
let neDB;

module.exports = class Client extends Discord.Client {
	/**
	 * Construct a new Discord.Client with some added functionality
	 * NEEDS TO BE CLEANED UP. NEEDS TO BE COMBINED WITH index.js. BASED ON Client FROM OLD AERBOT v1. BASED ON Client FROM SOME TUTORIAL BOT.
	 * @author acampagna
	 * @copyright Dauntless Gaming Community 2019
	 * @param {string} token bot token
	 * @param {string} commandsDir location of dir containing commands .js files
	 * @param {*} serverModel ServerData model to be used for app; must extend BaseServerData
	 */
	constructor(token, commandsDir, serverModel) {
		super({
			messageCacheMaxSize: 500,
			autofetch: [
				'MESSAGE_CREATE',
				'MESSAGE_REACTION_ADD'
			]
		});

		this._token = token;
		this.commandsDir = commandsDir;
		this.serverModel = serverModel;

		this.commands = RequireAll(this.commandsDir);

		this.on("ready", this._onReady);
		this.on("message", this._onMessage);
		this.on("debug", this._onDebug);
		this.on("error", this._onError);
		this.on("serverCreate", this._onServerCreate);
		this.on("serverDelete", this._onServerDelete);
		process.on("uncaughtException", err => this._onUnhandledException(this, err));
	}

	_onReady() {
		this.user.setActivity(InternalConfig.game);
		CoreUtil.dateLog(`Registered bot ${this.user.username}`);

		//We should be doing this eventually
		//this.removeDeletedServers();
	}

	_onMessage(message) {
		if (message.channel.type === "text" && message.member) {
			HandleServerMessage(this, message, this.commands);
		}
	}

	_onDebug(info) {
		info = info.replace(/Authenticated using token [^ ]+/, "Authenticated using token [redacted]");
		if (!InternalConfig.debugIgnores.some(x => info.startsWith(x)))
			CoreUtil.dateDebug(info);
	}

	_onError(error) {
		CoreUtil.dateLog("Error Occured!");
		CoreUtil.dateError(error);
	}

	_onServerCreate(server) {
		CoreUtil.dateLog(`Added to server ${server.name}`);
	}

	_onServerDelete(server) {
		//this.serverDataModel.findOneAndDelete({ serverID: server.id });
		CoreUtil.dateLog(`Removed from server ${server.name}, removing data for this server`);
	}

	_onUnhandledException(client, err) {
		CoreUtil.dateError("Unhandled exception!\n", err);
		CoreUtil.dateLog("Destroying existing client...");
		client.destroy().then(() => {
			CoreUtil.dateLog("Client destroyed, recreating...");
			setTimeout(() => client.login(client._token), InternalConfig.reconnectTimeout);
		});
	}

	bootstrap() {
		dbc = Mongoose.connect('mongodb://localhost/aerbot');
		
		//Need to finish removing Camo.
		Camo.connect("nedb://aerbot-data").then(db => {
			neDB = db;
			this.emit("beforeLogin");
			this.login(this._token);
		});
	}

	/*removeDeletedServers() {
		this.serverDataModel.find().then(serverDatas => {
			for (let serverData of serverDatas)
				if (!this.servers.get(serverData.serverID))
					serverData.delete();
		});
	}*/
};