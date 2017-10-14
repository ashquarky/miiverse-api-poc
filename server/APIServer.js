//loosely based on https://github.com/ProjectFii/3DFii/blob/master/API.js

const https = require("https");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const consts = require("../utils/consts.js");
const Log = require("../utils/Log.js");
const DataStorage = require("../storage/DataStorage.js");
const IncomingPost = require("../storage/IncomingPost.js");
const ResponseGen = require("./ResponseGen.js");

const app = express();
const mult = multer();

class APIServer {
    listen() {
        https.createServer({
            key: fs.readFileSync("certs/tmp-key.pem"),
            cert: fs.readFileSync("certs/tmp-cert.pem"),
        }, app).listen(consts.API_PORT);

        this.setupRequests();
    }

    setupRequests() {
        app.all("*", this.request.bind(this));
        app.get(`/${consts.API_VERSION}/communities/*`, this.communityRequest.bind(this));
        app.post(`/${consts.API_VERSION}/posts/*/empathies`, this.empathyRequest.bind(this));
        app.post(`/${consts.API_VERSION}/posts`, mult.array(), this.postRequest.bind(this));
    }

    request(req, res, next) {
        Log.debug(`Incoming request for ${req.url}`);
        next();
    }

    communityRequest(req, res) {
        const communityID = parseInt(req.params[0].split('/')[0], 10);
        const paramPack = this.decodeParamPack(req.headers["x-nintendo-parampack"]);

        let community = null;
        if (communityID === 0) {
            community = DataStorage.getDataStorage().getCommunityByTitleID(paramPack.title_id);
        } else {
            community = DataStorage.getDataStorage().getCommunityByID(communityID);
        }

        const posts = DataStorage.getDataStorage().getPostsByCommunity(community, req.query.limit);

        const response = ResponseGen.PostsResponse(posts, community);
        res.send(response);
    }

    empathyRequest(req, res) {
        const postID = req.params[0];
        DataStorage.getDataStorage().empathyPostByID(postID);

        const response = ResponseGen.EmptyResponse();
        res.send(response);
    }

    postRequest(req, res) {
        const communityID = parseInt(req.body.community_id, 10);
        const paramPack = this.decodeParamPack(req.headers["x-nintendo-parampack"]);

        let community = null;
        if (communityID === 0) {
            community = DataStorage.getDataStorage().getCommunityByTitleID(paramPack.title_id);
        } else {
            community = DataStorage.getDataStorage().getCommunityByID(communityID);
        }

        const appData = req.body.app_data.replace(/\0/g, "").trim();
        const painting = req.body.painting.replace(/\0/g, "").trim();

        let post = new IncomingPost({
            communityID: community.id,
            created: moment().tz("GMT").format(),
            body: req.body.body,
            painting,
        /*  We need auth for this. Might be worth making it DataStorage's problem. */
            screenName: "HTTP501",
            appData,
            tid: community.tids[0],
        });

        //TODO should be async
        post = DataStorage.getDataStorage().makePost(post);

        const response = ResponseGen.SinglePostResponse(post);
        res.send(response);
    }

    //TODO this code is a mess
    decodeParamPack(paramPack) {
        let dec = Buffer.from(paramPack, "base64").toString("ascii");
        dec = dec.slice(1, -1).split("\\");
        const out = {};
        for (let i = 0; i < dec.length; i += 2) {
            out[dec[i].trim()] = dec[i + 1].trim();
        }
        return out;
    }
}

if (typeof module !== "undefined") {
    module.exports = APIServer;
}
