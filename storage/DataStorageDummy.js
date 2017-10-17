const moment = require("moment-timezone");
const Post = require("./Post.js");
const Log = require("../utils/Log.js");
const consts = require("../utils/consts.js");

const POST_NUM = 200;

class DataStorageDummy {
    static async getCommunityByTitleID(tid) {
        const community = {
            id: 1,
            name: "Dummy Community",
            empathy: 1337,
            tids: [ tid ],
        };
        return community;
    }

    static async getCommunityByID(id) {
        let community = null;
        if (id === 0) {
            community = {
                id: 0,
                name: "Global Community",
                empathy: 0,
                tids: [ 0 ],
            };
        } else {
            community = {
                id,
                name: "Dummy Community",
                empathy: 1337,
                tids: [ consts.BAD_TITLE_ID ],
            };
        }
        return community;
    }

    static async getPostsByCommunity(community, limit) {
        const postNum = (POST_NUM > limit) ? limit : POST_NUM;
        Log.debug(`Generating ${postNum} posts...`);
        const posts = [];
        for (let i = 0; i < postNum; i++) {
            if (Math.floor(Math.random() * 3)) {
                posts.push(
                    new Post({
                        id: i,
                        pid: i,
                        tid: community.tids[0],
                        communityID: community.id,
                        created: moment().subtract(i, "seconds").tz("GMT").format(),

                        painting: consts.TEST_PAINTING,
                        empathy: 1337,
                        screenName: `User ${i}`,

                        //Splatoon application data
                        appData: "AwAAAP////8BAABBAHMAaAAAAD8APwA/AD8AAAAAAAAAAAAAAAAAAAAAAAAAAABBQQMAAP////8AAAAAAAAAAQAAAAIAAA+rAAABLwAAAAYAAAABAAAtOAAAB9gAAAACAAAAAgAAAAwAAAAKAAAACAAAAAAAAAu7AAAAAgAAAAIAAAAGAAAAAgAAAAAAAAAAAAAAAQAAAAIAAAACAAAAAAAAAAMAAAAKAAAAAAAAAAAAAAAIAAAAAP//////////AAAAAP8AAAD////9/////wAAAABpL8sJAAAAAAAAAAA/EZGSPzCwsT1AwMA/gAAAAAAA7NLIlEs=",
                    })
                );
            } else {
                posts.push(
                    new Post({
                        id: i,
                        pid: i,
                        tid: community.tids[0],
                        communityID: community.id,
                        created: moment().subtract(i, "seconds").tz("GMT").format(),

                        body: `Test post ${i}`,
                        empathy: 1337,
                        screenName: `User ${i}`,

                        //Splatoon application data
                        appData: "AwAAAP////8BAABBAHMAaAAAAD8APwA/AD8AAAAAAAAAAAAAAAAAAAAAAAAAAABBQQMAAP////8AAAAAAAAAAQAAAAIAAA+rAAABLwAAAAYAAAABAAAtOAAAB9gAAAACAAAAAgAAAAwAAAAKAAAACAAAAAAAAAu7AAAAAgAAAAIAAAAGAAAAAgAAAAAAAAAAAAAAAQAAAAIAAAACAAAAAAAAAAMAAAAKAAAAAAAAAAAAAAAIAAAAAP//////////AAAAAP8AAAD////9/////wAAAABpL8sJAAAAAAAAAAA/EZGSPzCwsT1AwMA/gAAAAAAA7NLIlEs=",
                    })
                );
            }
        }

        return posts;
    }

    static async empathyPostByID(id) {
        Log.debug("Empathied post", id);
    }

    static async makePost(post) {
        return new Post({
            id: 0,
            pid: 0,
            tid: post.tid,
            communityID: post.communityID,
            created: post.created,

            body: post.body,
            painting: post.painting,
            empathy: 0,
            screenName: post.screenName,

            appData: post.appData,
        });
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStorageDummy;
}
