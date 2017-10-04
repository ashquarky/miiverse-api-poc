const consts = require("../consts.js");
const DataStorageDummy = require("./DataStorageDummy.js");

class DataStorage {
    static getDataStorage() {
        if (consts.STORAGETYPE === consts.ENUM_STORAGETYPE.DUMMY) {
            return DataStorageDummy;
        }
        throw new Error(`Bad DataStorage type ${consts.STORAGETYPE}! Check consts.js.`);
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStorage;
}
