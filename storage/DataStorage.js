const consts = require("../consts.js");
const DataStorageDummy = require("./DataStorageDummy.js")

class DataStorage {
    static getDataStorage() {
        if (consts.STORAGETYPE == consts.ENUM_STORAGETYPE.DUMMY) {
            return DataStorageDummy;
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStorage;
}
