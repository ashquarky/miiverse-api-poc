const consts = require("./consts.js");
const APIServer = require("./APIServer.js");

console.log("Welcome to a thing (" + consts.VERSION + ")");

var api = new APIServer();
api.listen();
