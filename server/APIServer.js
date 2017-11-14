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
    async listen() {
        if (consts.USE_SSL) {
            https.createServer({
                key: fs.readFileSync("certs/tmp-key.pem"),
                cert: fs.readFileSync("certs/tmp-cert.pem"),
            }, app).listen(consts.API_PORT);
        } else {
            http.createServer(app).listen(consts.API_PORT);
        }

        await DataStorage.getDataStorage().init();

        this.setupRequests();
    }

    setupRequests() {
        app.all("*", wrap(this.request.bind(this)));
        app.get(`/${consts.API_VERSION}/communities/*`,
            wrap(this.communityRequest.bind(this)));
        app.post(`/${consts.API_VERSION}/posts/*/empathies`,
            wrap(this.empathyRequest.bind(this)));
        app.post(`/${consts.API_VERSION}/posts`,
            mult.array(), wrap(this.postRequest.bind(this)));
        app.get(`/${consts.API_VERSION}/topics`,
            wrap(this.topicRequest.bind(this)));
        app.get(`/${consts.API_VERSION}/people`,
            wrap(this.peopleRequest.bind(this)));
        app.all("/",
            wrap(this.rootRequest.bind(this)));
    }

    reqdie(res) {
        res.status(500);
        res.send(
            "Internal server error: Something went awfully wrong." +
            "\n\n" +
            "More details should be in the server logs. If you're an end " +
            "user, contact the server operator."
        );
    }

/*  Log *ALL* requests. Probably should change this to a different loglevel. */
    async request(req, res, next) {
        Log.debug(`Incoming request for ${req.url}`);
        next();
    }

/*  Show a bit of a message for the poor sods who try and load the endpoint in
    a web browser. */
    async rootRequest(req, res) {
        res.contentType("text/plain");
        res.status(418);
        res.send(
            "Hi! This is an API endpoint; so there's nothing here for your " +
            "browser. You should try pointing your Wii U here instead." +
            "\n\n" +
            "If you're self-hosting, just set up your HOSTS file. If you're " +
            "using an online endpoint, you should replace " +
            "discovery.olv.nintendo.net to help deal with SSL and the Host " +
            "header." +
            "\n\n" +
            "Have fun!"
        );
    }

/*  I wish this function could be optimised more... */
    async communityRequest(req, res) {
    /*  Parse out parameters from URL and headers */
        const communityID = parseInt(req.params[0].split('/')[0], 10);
        const paramPack = this.decodeParamPack(req.headers["x-nintendo-parampack"]);

    /*  Get community details. communityID is usually 0, for some reason. */
        let community = null;
        if (communityID === 0) {
            community = await DataStorage.getDataStorage()
                .getCommunityByTitleID(paramPack.title_id);
        } else {
            community = await DataStorage.getDataStorage()
                .getCommunityByID(communityID);
        }
        if (!community) {
            this.reqdie(res);
            return;
        }

    /*  Go to the database for posts. */
        const posts = await DataStorage.getDataStorage()
            .getPostsByCommunity(community, req.query.limit);
        if (!posts) {
            this.reqdie(res);
            return;
        }

    /*  Build formatted response and send it off. */
        const response = await ResponseGen.PostsResponse(posts, community);
        res.contentType("application/xml");
        res.send(response);
    }

    async empathyRequest(req, res) {
    /*  Extract post ID from URL (thanks Express!) */
        const postID = req.params[0];

    /*  Send post ID off to database. This will happen in the background */
        const empathyPromise = DataStorage.getDataStorage()
            .empathyPostByID(postID);

    /*  Respond to the client; they only want <has_error>0</has_error> anyway,
        so there's no need to wait around for the database */
        const response = await ResponseGen.EmptyResponse();
        res.contentType("application/xml");
        res.send(response);

    /*  Wait for the database to complete so we can catch any errors */
        await empathyPromise;
    }

    async postRequest(req, res) {
    /*  Decode some parameters from the POST data and headers */
        const communityID = parseInt(req.body.community_id, 10);
        const paramPack = this.decodeParamPack(req.headers["x-nintendo-parampack"]);
        const serviceToken = req.headers["x-nintendo-servicetoken"];
    /*  Send off tokens to the auth server. It's a promise, so this will happen
        asynchronously. */
        const accountPromise = NNIDAuth.getAccountByToken(serviceToken);

    /*  Get community details. Generally, communityID will be 0. */
        let community = null;
        if (communityID === 0) {
            community = await DataStorage.getDataStorage()
                .getCommunityByTitleID(paramPack.title_id);
        } else {
            community = await DataStorage.getDataStorage()
                .getCommunityByID(communityID);
        }

    /*  Santize base64 strings. */
        const appData = req.body.app_data.replace(/\0/g, "").trim();
        let painting = "";
        if (req.body.painting) {
            painting = req.body.painting.replace(/\0/g, "").trim();
        }

    /*  Build an IncomingPost object with all the information we've gathered.
        screenName will be fixed up once we check on the promise. */
        let post = new IncomingPost({
            communityID: community.id,
            created: moment().tz("GMT").format(),
            body: req.body.body,
            painting,
            appData,
            tid: community.tids[0],

            screenName: consts.BAD_SCREEN_NAME,
        });

    /*  Pass it off to DataStorage so that all the IDs and whatever will be
        assigned. Will return a proper Post object. */
        post = await DataStorage.getDataStorage().makePost(post);

    /*  Send the user a response. We may not even need this much - TODO can we
        get away with an EmptyResponse? */
        const response = await ResponseGen.SinglePostResponse(post);
        res.contentType("application/xml");
        res.send(response);

    /*  Resolve account promise. We finally have to wait around for external
        databases and things. Since we already responded to the user, it
        shouldn't matter that much. */
        const account = await accountPromise;

    /*  Fill in Post and submit to the database. */
        post.screenName = account.screenName;
        DataStorage.getDataStorage().submitPost(post);
        Log.debug(`${post.screenName}`);
    }

/*  Used during the generation of WaraWara Plaza.
    501 for now; WaraWara can be for another day. */
    async topicRequest(req, res) {
        res.status(501);
        res.send();
    }

/*  Used on the HOME menu? 501 for now; will implement later. */
    async peopleRequest(req, res) {
        res.status(501);
        res.send();
    }

    //TODO this code is a mess
    decodeParamPack(paramPack) {
    /*  Decode base64 */
        let dec = Buffer.from(paramPack, "base64").toString("ascii");
    /*  Remove starting and ending '/', split into array */
        dec = dec.slice(1, -1).split("\\");
    /*  Parameters are in the format [name, val, name, val]. Copy into out{}. */
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
