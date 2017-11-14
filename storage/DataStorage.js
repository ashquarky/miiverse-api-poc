const consts = require("../utils/consts.js");
const DataStorageDummy = require("./DataStorageDummy.js");
const DataStoragePostgres = require("./DataStoragePostgres");

class DataStorage {
    static getDataStorage() {
        if (consts.STORAGETYPE === consts.ENUM_STORAGETYPE.DUMMY) {
            return DataStorageDummy;
        } else if (consts.STORAGETYPE ===  consts.ENUM_STORAGETYPE.POSTGRES) {
            return DataStoragePostgres;
        }
        throw new Error(`Bad DataStorage type ${consts.STORAGETYPE}! Check consts.js.`);
    }
}

if (typeof module !== "undefined") {
    module.exports = DataStorage;
}
