"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
dotenv.config();
var Constants = /** @class */ (function () {
    function Constants() {
    }
    Constants.HOME_ASSISTANT_URL = process.env.HOME_ASSISTANT_URL;
    Constants.HOME_ASSISTANT_TOKEN = process.env.HOME_ASSISTANT_TOKEN;
    Constants.HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE = process.env.HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE;
    Constants.JIO_TV_URL = process.env.JIO_TV_URL;
    Constants.WEB_PORT = process.env.WEB_PORT;
    Constants.HOME_ASSISTANT_INTEGRATION_ENABLED = process.env.HOME_ASSISTANT_INTEGRATION_ENABLED;
    return Constants;
}());
exports.default = Constants;
console.log(JSON.stringify(Constants));
