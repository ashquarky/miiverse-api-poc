const consts = require("./consts.js");
const APIServer = require("./APIServer.js");

console.log(`Welcome to a thing (${consts.VERSION})`);

const api = new APIServer();
api.listen();
