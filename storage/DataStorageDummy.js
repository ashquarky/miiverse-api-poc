const moment = require("moment-timezone");
const Post = require("./Post.js");
const Log = require("../Log.js");

const RANDOM_TID = 0x0005000042454546;
const POST_NUM = 2;

class DataStorageDummy {
    static getCommunityByTitleID(tid) {
        const community = {
            id: 1,
            name: "Dummy Community",
            empathy: 1337,
            tids: [ tid ],
        };
        return community;
    }

    static getCommunityByID(id) {
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
                tids: [ RANDOM_TID ],
            };
        }
        return community;
    }

    static getPostsByCommunity(id, limit) {
        const postNum = (POST_NUM > limit) ? limit : POST_NUM;
        Log.debug(`Generating ${postNum} posts...`);
        const posts = [];
        for (let i = 0; i < postNum; i++) {
            posts.push(
                new Post({
                    id: i,
                    pid: i,
                    communityID: id,
                    created: moment().subtract(i, "seconds").tz("GMT").format(),

                    body: `Test post ${i}`,
                    empathy: 1337,
                    screenName: `User ${i}`,

                    //Splatoon application data
                    appData: "AwAAAP////8BAABBAHMAaAAAAD8APwA/AD8AAAAAAAAAAAAAAAAAAAAAAAAAAABBQQMAAP////8AAAAAAAAAAQAAAAIAAA+rAAABLwAAAAYAAAABAAAtOAAAB9gAAAACAAAAAgAAAAwAAAAKAAAACAAAAAAAAAu7AAAAAgAAAAIAAAAGAAAAAgAAAAAAAAAAAAAAAQAAAAIAAAACAAAAAAAAAAMAAAAKAAAAAAAAAAAAAAAIAAAAAP//////////AAAAAP8AAAD////9/////wAAAABpL8sJAAAAAAAAAAA/EZGSPzCwsT1AwMA/gAAAAAAA7NLIlEs=",
                })
            );
        }

        return posts;
    }

    static empathyPostByID(id) {
        Log.debug("Empathied post", id);
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStorageDummy;
}
