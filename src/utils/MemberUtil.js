// @ts-ignore
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
			return 10;
			break;
		case 'praise':
			return 20;
			break;
		case 'message':
			return 5;
			break;
		default:
			return 1;
	}
}

module.exports = {
	calculateNewExp,
	calculateActionExp
};