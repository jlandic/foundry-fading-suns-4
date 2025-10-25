const PREFIX = "Fading Suns 4";

export default class FS4Logger {
    static debug(message, ...args) {
        console.debug(`${PREFIX} | ${message}`, ...args);
    }

    static info(message, ...args) {
        console.info(`${PREFIX} | ${message}`, ...args);
    }

    static warn(message, ...args) {
        console.warn(`${PREFIX} | ${message}`, ...args);
    }

    static error(message, ...args) {
        console.error(`${PREFIX} | ${message}`, ...args);
    }
}
