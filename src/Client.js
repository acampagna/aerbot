const CoreUtil = require("./utils/Util.js");
const Camo = require("camo");
const CronJob = require("cron").CronJob;
const Discord = require("discord.js");
const HandleGuildMessage = require("./HandleGuildMessage");
const InternalConfig = require("./internal-config.json");
const RequireAll = require("require-all");
const Mongoose = require('mongoose');

let neDB;
let dbc;

module.exports = class Client extends Discord.Client {
	/**
	 * Construct a new Discord.Client with some added functionality
	 * @param {string} token bot token
	 * @param {string} commandsDir location of dir containing commands .js files
	 * @param {*} guildDataModel GuildData model to be used for app; must extend BaseGuildData
	 */
	constructor(token, commandsDir, guildDataModel) {
		super({
			messageCacheMaxSize: 1000,
			autofetch: [
				'MESSAGE_CREATE',
				'MESSAGE_REACTION_ADD'
			]
		});

		this._token = token;
		this.commandsDir = commandsDir;
		this.guildDataModel = guildDataModel;

		this.commands = RequireAll(this.commandsDir);

		this.on("ready", this._onReady);
		this.on("message", this._onMessage);
		this.on("debug", this._onDebug);
		this.on("guildCreate", this._onGuildCreate);
		this.on("guildDelete", this._onGuildDelete);
		process.on("uncaughtException", err => this._onUnhandledException(this, err));
	}

	_onReady() {
		this.user.setActivity(InternalConfig.game);
		CoreUtil.dateLog(`Registered bot ${this.user.username}`);

		this.removeDeletedGuilds();
	}

	_onMessage(message) {
		if (message.channel.type === "text" && message.member)
			HandleGuildMessage(this, message, this.commands);
	}

	_onDebug(info) {
		info = info.replace(/Authenticated using token [^ ]+/, "Authenticated using token [redacted]");
		if (!InternalConfig.debugIgnores.some(x => info.startsWith(x)))
			CoreUtil.dateDebug(info);
	}

	_onGuildCreate(guild) {
		CoreUtil.dateLog(`Added to guild ${guild.name}`);
	}

	_onGuildDelete(guild) {
		this.guildDataModel.findOneAndDelete({ guildID: guild.id });

		CoreUtil.dateLog(`Removed from guild ${guild.name}, removing data for this guild`);
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
		dbc = Mongoose.connect('mongodb://localhost/test');

		const Cat = Mongoose.model('Cat', { name: String });

		const kitty = new Cat({ name: 'Zildjian' });
		kitty.save().then(() => console.log('meow'));

		Camo.connect("nedb://aerbot-data").then(db => {
			neDB = db;

			compactCollections();
			new CronJob(InternalConfig.dbCompactionSchedule, compactCollections, null, true);

			this.emit("beforeLogin");
			this.login(this._token);
		});
	}

	removeDeletedGuilds() {
		this.guildDataModel.find().then(guildDatas => {
			for (let guildData of guildDatas)
				if (!this.guilds.get(guildData.guildID))
					guildData.delete();
		});
	}
};

function compactCollections() {
	CoreUtil.dateLog("Collection Keys: " + Object.keys(neDB._collections));
	for (let collectionName of Object.keys(neDB._collections))
		neDB._collections[collectionName].persistence.compactDatafile();
}