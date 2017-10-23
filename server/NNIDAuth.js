const consts = require("../utils/consts.js");

class NNIDAuth {
    static async getAccountByToken(token) {
        const stubAcct = {
            id: 0,
            screenName: "HTTP501",
        }
        return stubAcct;
    }
}

if (typeof module !== "undefined") {
    module.exports = NNIDAuth;
}
