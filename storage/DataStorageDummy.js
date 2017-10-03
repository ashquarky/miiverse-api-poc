const moment = require("moment-timezone");

class DataStorageDummy {
    constructor() {

    }

    static getCommunityByTitleID(tid) {
        var community = {
            id : 1,
            name : "Dummy Community",
            empathy : 1337,
            tids : [ tid ],
        }
        return community;
    }

    static getCommunityByID(id) {
        var community;
        if (id == 0) {
            community = {
                id : 0,
                name : "Global Community",
                empathy : 0,
                tids : [ 0 ],
            }
        } else {
            community = {
                id : id,
                name : "Dummy Community",
                empathy : 1337,
                tids : [ 0x0005000042454546 ],
            };
        }
        return community;
    }

    static getPostsByCommunity(id, limit) {
        var max_post_num = 20; //TODO
        if (max_post_num >= limit) {
            max_post_num = limit - 1;
        }
        var posts = [];
        for (var i = 0; i < max_post_num; i++) {
            posts.push({
                    id : i,
                    pid : i,
                    community_id : id,
                    created : moment().subtract(i, "days").tz("GMT").format(),

                    body : "Hello World!" + i,
                    empathy : 1337,
                    screen_name : "steve" + i,

                    //Splatoon application data
                    app_data : "AwAAAP////8BAABBAHMAaAAAAD8APwA/AD8AAAAAAAAAAAAAAAAAAAAAAAAAAABBQQMAAP////8AAAAAAAAAAQAAAAIAAA+rAAABLwAAAAYAAAABAAAtOAAAB9gAAAACAAAAAgAAAAwAAAAKAAAACAAAAAAAAAu7AAAAAgAAAAIAAAAGAAAAAgAAAAAAAAAAAAAAAQAAAAIAAAACAAAAAAAAAAMAAAAKAAAAAAAAAAAAAAAIAAAAAP//////////AAAAAP8AAAD////9/////wAAAABpL8sJAAAAAAAAAAA/EZGSPzCwsT1AwMA/gAAAAAAA7NLIlEs=",
                });
        }

        return posts;
    }

    static empathyPostByID(id) {
        console.log("Empathied post", id);
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStorageDummy;
}
