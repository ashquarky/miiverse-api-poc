//loosely based on https://github.com/ProjectFii/3DFii/blob/master/API.js

const https = require("https");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const consts = require("./consts.js");
const DataStorage = require("./storage/DataStorage.js");
const ResponseGen = require("./ResponseGen.js")

var app = express();
var mult = multer();

class APIServer {
    constructor() {
        console.log("mmph");
    }

    listen() {
        https.createServer({
            key : fs.readFileSync('certs/tmp-key.pem'),
            cert : fs.readFileSync('certs/tmp-cert.pem'),
        }, app).listen(consts.API_PORT);

        this.setupRequests();
    }

    setupRequests() {
        app.all("*", this.request);
        app.get(`/${consts.API_VERSION}/communities/*`, this.communityRequest.bind(this));
        app.post(`/${consts.API_VERSION}/posts/*/empathies`, this.empathyRequest.bind(this));
        app.post(`/${consts.API_VERSION}/posts`, mult.array(), this.postRequest.bind(this));
    }

    request(req, res, next) {
        console.log("Request! " + `https://${req.headers.host}${req.url}`);

        next();
    }

    communityRequest(req, res, next) {
        var communityID = req.params[0].split('/')[0];
        var paramPack = this.decodeParamPack(req.headers['x-nintendo-parampack']);

        var community;
        if (communityID == 0) {
            community = DataStorage.getDataStorage().getCommunityByTitleID(paramPack.title_id);
        } else {
            //community = DataStorage.getDataStorage().getCommunityByTitleID();
            community = DataStorage.getDataStorage().getCommunityByID(communityID);
        }

        var posts = DataStorage.getDataStorage().getPostsByCommunity(community.id, req.query.limit);

        var response = ResponseGen.PostsResponse(posts, community);
        console.log(response);
        res.send(response);
    }

    empathyRequest(req, res, next) {
        var postID = req.params[0];
        DataStorage.getDataStorage().empathyPostByID(postID);

        var response = ResponseGen.EmptyResponse();
        res.send(response);
    }

    postRequest(req, res, next) {
        console.log(req.body);
    }

    decodeParamPack(paramPack) {
        var dec = new Buffer(paramPack, "base64").toString("ascii");
        dec = dec.slice(1, -1).split('\\');
        var out = {};
        for (var i = 0; i < dec.length; i += 2) {
            out[dec[i].trim()] = dec[i + 1].trim();
        }
        return out;
    }
}

if (typeof module !== "undefined") {
    module.exports = APIServer;
}
