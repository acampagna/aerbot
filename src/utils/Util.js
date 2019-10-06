/**
 * General utils. Used everwhere. Utils like this are generally not a great idea but I don't care. 
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
const Discord = require("discord.js");
const Console = require("console");
const SimpleFileWriter = require("simple-file-writer");

const logWriter = new SimpleFileWriter("./console.log");
const debugLogWriter = new SimpleFileWriter("./debug.log");

function aerLog(client, message) {
	client.channels.get("625025213171499011").send(message);
	dateError(message);
}

function log(...args) {
	doDateLog(Console.log, logWriter, args, "INFO");
}

function dateLog(...args) {
	doDateLog(Console.log, logWriter, args, "INFO");
}

function error(...args) {
	doDateLog(Console.error, logWriter, args, "ERROR");
}

function dateError(...args) {
	doDateLog(Console.error, logWriter, args, "ERROR");
}

function debugError(...args) {
	doDateLog(null, null, args, "DEBUG ERROR");
}

function dateDebugError(...args) {
	doDateLog(null, null, args, "DEBUG ERROR");
}

function debug(...args) {
	doDateLog(null, null, args, "DEBUG");
}

function dateDebug(...args) {
	doDateLog(null, null, args, "DEBUG");
}

function isMemberAdmin(message, serverData) {
	//return message.member.permissions.has("ADMINISTRATOR") || message.member.roles.get(serverData.officerRoleId);
	return message.member.permissions.has("ADMINISTRATOR");
}

function createParams(str) {
	return paramStr.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
    }, {a: ['']}).a
}

//replacements is an object with keys of numbers starting at 1
//No idea what this is used for....
function doFormatting(format, replacements) {
	return format.replace("$1", replacements.one).replace("$2", replacements.two).replace("$3", replacements.three);
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function doDateLog(consoleMethod, fileWriter, args, prefix = "") {
	args = formatArgs([`[${prefix}]`].concat(args));

	if (consoleMethod !== null)
		consoleMethod.apply(this, args);

	if (fileWriter !== null)
		fileWriter.write(formatArgsForFile(args));

	debugLogWriter.write(formatArgsForFile(args));
}

function formatArgs(args) {
	return [`[${new Date().toUTCString()}]`].concat(args);
}

function formatArgsForFile(args) {
	return args.join(" ") + "\n";
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
function waitFor(ms) {
	new Promise(r => setTimeout(r, ms));
}

function sendQotd(qotd, client, serverData) {
	var date = new Date();
	var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

	const embed = new Discord.RichEmbed();
	embed.setTitle("Question of the Day - " + date.toLocaleDateString("en-US", options));
	embed.setColor("GOLD");
	embed.setDescription("**" + qotd + "**");
	embed.setFooter("Please share your answer with us today! Note: Only 1 post in this channel per person per day so make it count. To make a new post you must delete the original");
	
	var qotdChan = client.channels.get(serverData.qotdChannelId);
	
	qotdChan.send(embed).then(function (message) {
		serverData.updateQotdMessageId(message.id);
	}).catch(function() {
		//Something
	});
}

function sendOneWordStory(client, serverData) {
	const embed = new Discord.RichEmbed();
	embed.setTitle("One Word Story - Halloweed");
	embed.setColor("GOLD");
	embed.setDescription("The rules are simple. Everyone ");
	embed.setFooter("Please share your answer with us today! *Note: Only 1 post in this channel per person per day so make it count. To make a new post you must delete the original*");
	
	var qotdChan = client.channels.get(serverData.qotdChannelId);
	
	qotdChan.send(embed).then(function (message) {
		serverData.updateQotdMessageId(message.id);
	}).catch(function() {
		//Something
	});
}

module.exports = {
	error,
	dateError,
	log,
	dateLog,
	debug,
	dateDebug,
	debugError,
	dateDebugError,
	isMemberAdmin,
	doFormatting,
	isNumber,
	aerLog,
	asyncForEach,
	waitFor,
	sendQotd
};