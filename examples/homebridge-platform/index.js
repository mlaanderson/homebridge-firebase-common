var types = require("HAP-NodeJS-Types").TypeUUIDs;

class FirebasePlatform {
    constructor(log, config) {
        this._log = log;
        this._config = config;
    }
    
    accessories(callback) {
        // if all the accessories have been found
        // just execute the callback
    }
}