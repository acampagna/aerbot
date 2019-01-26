/**
 * Member utilities. Only deals with member exp right now.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
const CoreUtil = require("./Util.js");

function calculateNewExp(action, currentExp) {
	CoreUtil.dateLog(`Adding ${calculateActionExp(action)} exp`);
	return currentExp + calculateActionExp(action);
}

function calculateActionExp(action) {
	switch(action) {
		case 'lottery':
			return 100;
			break;
		case 'reaction':
			return 4;
			break;
		case 'praise':
			return 10;
			break;
		case 'message':
			return 1;
			break;
		default:
			return 1;
	}
}

module.exports = {
	calculateNewExp,
	calculateActionExp
};