const moment = require("moment-timezone");
const Log = require("../Log.js");
const consts = require("../consts.js")

class IncomingPost {
    constructor({ tid, communityID, created, body, painting, screenName, appData }) {
        this.tid = tid;
        this.communityID = communityID;
        this.created = created;
        this.body = body;
        this.painting = painting;
        this.screenName = screenName;
        this.appData = appData;

        if (!this.tid) {
            Log.warn("Undeclared TitleID when constructing IncomingPost object!");
            this.tid = consts.BAD_TITLE_ID;
        }
        if (!this.communityID && this.communityID !== 0) {
            Log.warn("Undeclared communityID when constructing IncomingPost object!");
            this.communityID = consts.BAD_COMM_ID;
        }
        if (!this.created) {
            Log.warn("Undeclared create time when constructing IncomingPost object!");
            this.created = moment().tz("GMT").format();
        }
        if (!this.screenName) {
            Log.warn("Undeclared screenName when constructing IncomingPost object!");
            this.screenName = consts.BAD_SCREEN_NAME;
        }
        if (!this.body && !this.painting) {
            Log.warn("IncomingPost has no content!");
            this.body = consts.BAD_POST_TEXT;
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = IncomingPost;
}
