const consts = require("./consts.js");
const APIServer = require("./APIServer.js");
const Log = require("./Log.js");

Log.info(`Welcome to a thing (${consts.VERSION})`);

const api = new APIServer();
api.listen();
