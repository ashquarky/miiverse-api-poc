//loosely based on https://github.com/ProjectFii/3DFii/blob/master/API.js

const https = require("https");
const http = require("http");
const express = require("express");
const wrap = require("async-middleware").wrap;
const multer = require("multer");
const fs = require("fs");
const moment = require("moment-timezone");
const consts = require("../utils/consts.js");
const Log = require("../utils/Log.js");
const DataStorage = require("../storage/DataStorage.js");
const IncomingPost = require("../storage/IncomingPost.js");
const ResponseGen = require("./ResponseGen.js");
const NNIDAuth = require("./NNIDAuth.js");

const app = express();
const mult = multer();

class APIServer {
    listen() {
        if (consts.USE_SSL) {
            https.createServer({
                key: fs.readFileSync("certs/tmp-key.pem"),
                cert: fs.readFileSync("certs/tmp-cert.pem"),
            }, app).listen(consts.API_PORT);
        } else {
            http.createServer(app).listen(consts.API_PORT);
        }

        this.setupRequests();
    }

    setupRequests() {
        app.all("*", wrap(this.request.bind(this)));
        app.get(`/${consts.API_VERSION}/communities/*`, wrap(this.communityRequest.bind(this)));
        app.post(`/${consts.API_VERSION}/posts/*/empathies`, wrap(this.empathyRequest.bind(this)));
        app.post(`/${consts.API_VERSION}/posts`, mult.array(), wrap(this.postRequest.bind(this)));
    }

    async request(req, res, next) {
        Log.debug(`Incoming request for ${req.url}`);
        next();
    }

    async communityRequest(req, res) {
        const communityID = parseInt(req.params[0].split('/')[0], 10);
        const paramPack = this.decodeParamPack(req.headers["x-nintendo-parampack"]);

        let community = null;
        if (communityID === 0) {
            community = await DataStorage.getDataStorage().getCommunityByTitleID(paramPack.title_id);
        } else {
            community = await DataStorage.getDataStorage().getCommunityByID(communityID);
        }

        const posts = await DataStorage.getDataStorage().getPostsByCommunity(community, req.query.limit);

        const response = await ResponseGen.PostsResponse(posts, community);
        res.contentType("application/xml");
        res.send(response);
    }

    async empathyRequest(req, res) {
        const postID = req.params[0];

        const [ response ] = await Promise.all([
            ResponseGen.EmptyResponse(),
            DataStorage.getDataStorage().empathyPostByID(postID),
        ]);

        res.contentType("application/xml");
        res.send(response);
    }

    async postRequest(req, res) {
        const communityID = parseInt(req.body.community_id, 10);
        const paramPack = this.decodeParamPack(req.headers["x-nintendo-parampack"]);
        const accountPromise = NNIDAuth.getAccountByToken(req.headers["x-nintendo-servicetoken"]);

        let community = null;
        if (communityID === 0) {
            community = await DataStorage.getDataStorage().getCommunityByTitleID(paramPack.title_id);
        } else {
            community = await DataStorage.getDataStorage().getCommunityByID(communityID);
        }

        const appData = req.body.app_data.replace(/\0/g, "").trim();
        const painting = req.body.painting.replace(/\0/g, "").trim();

        let post = new IncomingPost({
            communityID: community.id,
            created: moment().tz("GMT").format(),
            body: req.body.body,
            painting,
            appData,
            tid: community.tids[0],

            screenName: consts.BAD_SCREEN_NAME,
        });

        post = await DataStorage.getDataStorage().makePost(post);

        const response = await ResponseGen.SinglePostResponse(post);
        res.contentType("application/xml");
        res.send(response);

        const account = await accountPromise;
        post.screenName = account.screenName;
        DataStorage.getDataStorage().submitPost(post);
        Log.debug(`${post.screenName}`);
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
