const moment = require("moment-timezone");
const consts = require("../consts.js");
const Log = require("../Log.js");

class Post {
    constructor({ id, pid, tid, communityID, created, body, painting, empathy, screenName, appData }) {
        this.id = id;
        this.pid = pid;
        this.tid = tid;
        this.communityID = communityID;
        this.created = created;
        this.body = body;
        this.painting = painting;
        this.empathy = empathy;
        this.screenName = screenName;
        this.appData = appData;

    /*  This is probably the C developer in me talking, but I *really* need some
        kind of confirmation that I didn't screw up here.
        If I do screw up, it makes it all the way down into the XML without so
        much as a runtime warning O_O */
        if (!this.id && this.id !== 0) {
            Log.warn("Undeclared id when constructing Post object!");
            this.id = consts.BAD_POST_ID;
        }
        if (!this.pid && this.pid !== 0) {
            Log.warn("Undeclared pid when constructing Post object!");
            this.pid = consts.BAD_POST_PID;
        }
        if (!this.communityID && this.communityID !== 0) {
            Log.warn("Undeclared communityID when constructing Post object!");
            this.communityID = consts.BAD_COMM_ID;
        }
        if (!this.created) {
            Log.warn("Undeclared create time when constructing Post object!");
            this.created = moment().tz("GMT").format();
        }
        if (!this.empathy && this.empathy !== 0) {
            Log.warn("Undeclared empathy when constructing Post object!");
            this.empathy = 0;
        }
        if (!this.screenName) {
            Log.warn("Undeclared screenName when constructing Post object!");
            this.screenName = consts.BAD_SCREEN_NAME;
        }
        if (!this.tid) {
            Log.warn("Undeclared TitleID when constructing Post object!");
            this.tid = consts.BAD_TITLE_ID;
        }

        if (!this.body && !this.painting) {
            Log.warn("Post has no content!");
            this.body = consts.BAD_POST_TEXT;
        }

        if (this.painting) {
            this.painting_sz = Buffer.from(this.painting, "base64").length;
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = Post;
}
