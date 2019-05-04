import CoreUtil = require("./utils/Util.js");
import Camo = require("camo");
const CronJob = require("cron").CronJob;
import { Client, Message } from 'discord.js'
import HandleGuildMessage = require("./HandleGuildMessage");
import InternalConfig = require("./internal-config.json");
import RequireAll = require("require-all");
import Mongoose = require('mongoose');

let neDB;
let dbc;

export class Aerbot {
	/**
	 * Construct a new Discord.Client with some added functionality
	 * NEEDS TO BE CLEANED UP. NEEDS TO BE COMBINED WITH index.js. BASED ON Client FROM OLD AERBOT v1. BASED ON Client FROM SOME TUTORIAL BOT.
	 * @author acampagna
	 * @copyright Dauntless Gaming Community 2019
	 * @param {string} token bot token
	 * @param {string} commandsDir location of dir containing commands .js files
	 * @param {*} guildModel GuildData model to be used for app; must extend BaseGuildData
	 */

	private _token;
	public commandsDir;
	public guildModel;
	public commands;
	public client: Client;

	constructor(token, commandsDir, guildModel) {
		this.client = new Client();

		console.log("Constructed");
		//console.log("Client:", this.client);

		this._token = token;
		this.commandsDir = commandsDir;
		this.guildModel = guildModel;
	}

	public start(): void {

		this.commands = RequireAll(this.commandsDir);

		this.client.on("ready", () => {
			//console.log("Client:", this.client);
			//console.log("Client User:", this.client.user);
			this.client.user.setActivity(InternalConfig.game);
			CoreUtil.dateLog(`Registered bot ${this.client.user.username}`);

			//We should be doing this eventually
			//this.removeDeletedGuilds();
		});

		this.client.on("message", (message) => {
			if (message.channel.type === "text" && message.member) {
				HandleGuildMessage(this, message, this.commands);
			}
		});


		this.client.on("debug", (info) => {
			info = info.replace(/Authenticated using token [^ ]+/, "Authenticated using token [redacted]");
			if (!InternalConfig.debugIgnores.some(x => info.startsWith(x)))
				CoreUtil.dateDebug(info);
		});

		this.client.on("error", (error) => {
			CoreUtil.dateLog("Error Occured!");
			CoreUtil.dateError(error);
		});

		this.client.on("guildCreate", (guild) => {
			CoreUtil.dateLog(`Added to guild ${guild.name}`);
		});

		this.client.on("guildDelete", (guild) => {
			//this.guildDataModel.findOneAndDelete({ guildID: guild.id });
			CoreUtil.dateLog(`Removed from guild ${guild.name}, removing data for this guild`);
		});

		process.on("uncaughtException", err => this._onUnhandledException(this.client, err));
	}

	_onUnhandledException(client, err) {
		CoreUtil.dateError("Unhandled exception!\n", err);
		CoreUtil.dateLog("Destroying existing client...");
		this.client.destroy().then(() => {
			CoreUtil.dateLog("Client destroyed, recreating...");
			//setTimeout(() => client.login(client._token), InternalConfig.reconnectTimeout);
			setTimeout(() => client.login(this._token), 1000);
		});
	}

	bootstrap() {
		dbc = Mongoose.connect('mongodb://localhost/aerbot');

		//Need to finish removing Camo.
		Camo.connect("nedb://aerbot-data").then(db => {
			neDB = db;
			this.client.emit("beforeLogin");
			this.client.login(this._token);
		});
	}

	/*removeDeletedGuilds() {
		this.guildDataModel.find().then(guildDatas => {
			for (let guildData of guildDatas)
				if (!this.guilds.get(guildData.guildID))
					guildData.delete();
		});
	}*/
};