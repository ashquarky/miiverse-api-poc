/*  Expected DB layout (for now:)
    ----TABLE: COMMUNITIES----
    cid int, //community id
    name varchar(whatever), //community name
    tids bigint ARRAY, //decimal titleIDs
    empathy int, //empathy count
    main bool, //False if the community is a sub-community of a game.

    ----TABLE: POSTS----
    id [anything], //post id, int or string, must be autoassigned by DB
    cid int, //community id
    created timestamp, //time of creation, GMT

    painting text, //painting (if present)
    post text, //written post
    empathy int, //empathy count

    appData text, //application data
*/

const { Client } = require("pg");
const moment = require("moment-timezone");
const Post = require("./Post.js");
const Log = require("../utils/Log.js");
const consts = require("../utils/consts.js");
const client = new Client();

const qCommunityByTID = "SELECT cid, name, tids, empathy FROM communities " +
                        "WHERE $1 = ANY(communities.tids) AND main = true";
const qCommunityByID = "SELECT cid, name, tids, empathy FROM communities " +
                       "WHERE $1 = cid AND main = true";
const qPostsByCID = "SELECT id, created, painting, post, empathy, " +
                    "appdata FROM posts WHERE $1 = cid ORDER by created " +
                    "LIMIT $2";
const qEmpathyPostByID = "UPDATE posts SET empathy = empathy + 1 WHERE id = $1";

const POSTS_MAX = 1000;

class DataStoragePostgres {
    static async getCommunityByTitleID(tid) {
        let res = null;
        try {
            res = await client.query(qCommunityByTID, [ tid ]);
        } catch (err) {
            Log.error("Database error in getCommunityByTitleID!");
            Log.error(err);
            return null;
        }
        if (!res) {
            Log.error(`Database returned ${res}.`);
            return null;
        } else if (res.rowCount === 0) {
            Log.info(`TID ${tid} not found in DB.`);
            return null;
        } else if (res.rowCount > 1) {
            Log.warn(`TID ${tid} has ${res.rowCount} main communities!`);
            Log.warn("It should only have one.");
        }

        const [ DBCommunity ] = res.rows;
        const community = {
            id: DBCommunity.cid,
            name: DBCommunity.name,
            empathy: DBCommunity.empathy,
            tids: DBCommunity.tids,
        };
        return community;
    }

    static async getCommunityByID(id) {
        let res = null;
        try {
            res = await client.query(qCommunityByID, [ id ]);
        } catch (err) {
            Log.error("Database error in getCommunityByID!");
            Log.error(err);
            return null;
        }
        if (!res) {
            Log.error(`Database returned ${res}.`);
            return null;
        } else if (res.rowCount === 0) {
            Log.info(`CID ${id} not found in DB.`);
            return null;
        } else if (res.rowCount > 1) {
            Log.warn(`${res.rowCount} communities share CID ${id}!`);
        }

        const [ DBCommunity ] = res.rows;
        const community = {
            id: DBCommunity.cid,
            name: DBCommunity.name,
            empathy: DBCommunity.empathy,
            tids: DBCommunity.tids,
        }
        return community;
    }

    static async getPostsByCommunity(community, limit) {
        const posts = [];
        let res = null;
    /*  Clamp results to POSTS_MAX, don't work the DB too hard */
        limit = Math.min(limit, POSTS_MAX);
        try {
            res = await client.query(qPostsByCID, [ community.id, limit ]);
        } catch (err) {
            Log.error("Database error in getPostsByCommunity!");
            Log.error(err);
            return null;
        }
        if (!res) {
            Log.error(`Database returned ${res}.`);
            return null;
        } else if (res.rowCount === 0) {
        /*  Maybe remove this in prod */
            Log.debug(`CID ${community.id} has no posts.`);
            return null;
        } else if (res.rowCount > limit) {
            Log.warn(`SQL bug: Expected ${limit} posts, got ${res.rowCount}`);
            res.rows = res.rows.slice(0, limit);
        }
        for (let row of res.rows) {
            posts.push(
                new Post({
                    id: row.id,
                    pid: row.id,
                /*  Is this bad? Idk. */
                    tid: community.tids[0],
                    communityID: community.id,
                /*  TODO this seems to be off by an hour - DST? */
                    created: moment(row.created, "GMT").format(),

                    painting: row.painting,
                    body: row.post,
                    empathy: row.empathy,
                    screenName: consts.BAD_SCREEN_NAME, //TODO

                    appData: row.appdata,
                })
            );
            Log.debug(posts[posts.length - 1]);
        }
        return posts;
    }

    static async empathyPostByID(id) {
        let res = null;
        try {
            res = await client.query(qEmpathyPostByID, [ id ]);
        } catch (err) {
            Log.error("Database error in empathyPostByID!");
            Log.error(err);
            return null;
        }
        Log.debug(res);
    }

    static async init() {
        Log.info("Connecting to PostgreSQL...");
        await client.connect().catch(function(reason) {
            Log.error("Failed to connect to database!");
            Log.error(reason);
        });
        Log.info("Connected!");
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStoragePostgres;
}
