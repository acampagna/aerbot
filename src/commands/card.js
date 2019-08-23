const CoreUtil = require("../utils/Util.js");
//const ImgUtil = require("../utils/ImgUtil.js");
const Command = require("../Command.js");
//const Canvas = require("canvas");

module.exports = new Command({
	name: "card",
	description: "Prints user card",
	syntax: "card",
	admin: false,
	invoke
});

/**
 * Prototype of playing around with server-side image manipulation and rendering.
 * UNFINISHED. PROTOTYPE. REQUIRES EXTRA SETUP TO USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	try{
		console.log(message.member.user.fetchProfile());
		/*const canvas = new Canvas.createCanvas(600, 200);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(await Canvas.loadImage("res/bg.png"), 0, 0);
		ctx.drawImage(await Canvas.loadImage(message.member.user.displayAvatarURL), 20, 25, 150, 150);*/

		/*message.channel.send({
			files: [{
				attachment: canvas.toBuffer(),
				name: "profile-"+message.member.id+".jpg"
			}]
		});*/

		//const avatar = message.member.user.displayAvatarURL;
		//ctx.drawImage(bg,0,0);
		//ctx.drawImage(avatar,50,50);
		
		return Promise.resolve("Work in progress...");
	} catch(e) {
		console.error(e)
	}

	return Promise.resolve("Work in progress...");
}