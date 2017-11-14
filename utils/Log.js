/* eslint no-console: 0 */

const RESET = "\x1b[0m";
const BRIGHT = "\x1b[1m";
const DIM = "\x1b[2m";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";

class Log {
    static debug(msg) {
        console.log(`${DIM}${CYAN}[DEBUG]${RESET}${DIM}`, msg, RESET);
    }
    static info(msg) {
        console.log(`${BRIGHT}${BLUE}[INFO ]${RESET}`, msg, RESET);
    }
    static warn(msg) {
        console.warn(`${BRIGHT}${YELLOW}[WARN ]${RESET}`, msg, RESET);
    }
    static error(msg) {
        console.warn(`${BRIGHT}${RED}[ERROR]${RESET}${BRIGHT}`, msg, RESET);
    }
}

if (typeof module !== "undefined") {
    module.exports = Log;
}
