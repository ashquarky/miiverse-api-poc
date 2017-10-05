if (typeof module !== "undefined") {
    exports.ENUM_STORAGETYPE = {
        DUMMY: 0,
    };

    exports.VERSION = "alpha";
    exports.API_VERSION = "v1";
    exports.API_PORT = 5000;
    exports.STORAGETYPE = exports.ENUM_STORAGETYPE.DUMMY;

    exports.BAD_POST_ID = "BAD_POST";
    exports.BAD_POST_PID = 0xDEADC0DE;
    exports.BAD_COMM_ID = 0xDEADC0DE;
    exports.BAD_SCREEN_NAME = "BAD_USER";
    exports.BAD_POST_TEXT = "An internal error occured.";
}
