/**
 * General utils. Used everwhere. Utils like this are generally not a great idea but I don't care. 
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
const Discord = require("discord.js");
const Console = require("console");

function isNumber(n) { 
	return !isNaN(parseFloat(n)) && !isNaN(n - 0) 
}

function isObject(obj) {
	return obj === Object(obj);
}

function isEmpty(str) {
	return str.trim().length === 0;
}

function isHexColor(color) {
	var regex = new RegExp("^#([0-9A-F]{3}){1,2}$","i");
	console.log("___");
	console.log(color);
	console.log(regex.test(color));
	console.log("___");
	return regex.test(color);
}

module.exports = {
	isNumber,
	isObject,
	isEmpty,
	isHexColor
};