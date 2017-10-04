const xmlbuilder = require("xmlbuilder");
const moment = require("moment-timezone");

class ResponseGen {
/*  TODO lots of stubs and constants in here */
    static PostsResponse(posts, community) {
        const xml = xmlbuilder.create("result")
            .e("has_error", "0").up()
            .e("version", "1").up()
            .e("request_name", "posts").up()
            .e("topic")
                .e("community_id", community.id).up()
            .up()
            .e("posts");
                for (let i = 0; i < posts.length; i++) {
                    xml.e("post")
                        .e("app_data", posts[i].appData).up()
                        .e("body", posts[i].body).up()
                        .e("community_id", community.id).up()
                        .e("country_id", "254").up()
                        .e("created_at", moment(posts[i].created).tz("GMT").format("YYYY-MM-DD hh:mm:ss")).up()
                        .e("feeling_id", "1").up()
                        .e("id", posts[i].id).up()
                        .e("is_autopost", "0").up()
                        .e("is_community_private_autopost", "0").up()
                        .e("is_spoiler", "0").up()
                        .e("is_app_jumpable", "0").up()
                        .e("empathy_count", posts[i].empathy).up()
                        .e("language_id", "1").up()
                        .e("number", "0").up()
                        .e("pid", posts[i].pid).up()
                        .e("platform_id", "1").up()
                        .e("region_id", "4").up()
                        .e("reply_count", "0").up()
                        .e("screen_name", posts[i].screenName).up()
                        .e("title_id", community.tids[0]).up()
                    .up();
                }

        return xml.end({ pretty: true });
    }

    static EmptyResponse() {
        const xml = xmlbuilder.create("result")
            .e("has_error", "0").up()
            .e("version", "1").up();
        return xml.end({ pretty: true });
    }
}

if (typeof module !== "undefined") {
    module.exports = ResponseGen;
}
