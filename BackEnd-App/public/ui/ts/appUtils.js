"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = getConfiguration;
function getConfiguration() {
    // @ts-ignore
    let restHostURL = window.APP_REST_REQUESTS_HOST;
    let config = {};
    // @ts-ignore
    restHostURL = `http://${window.location.hostname}:${window.location.port}`;
    if (!restHostURL) {
        restHostURL = "http://localhost:8089";
    }
    config.hostName = restHostURL;
    return config;
}
