const consts = require("./utils/consts.js");
const APIServer = require("./server/APIServer.js");
const Log = require("./utils/Log.js");

Log.info(`Welcome to a thing (${consts.VERSION})`);

const api = new APIServer();
api.listen();

Log.info(`Now listening on port ${consts.API_PORT}`);
