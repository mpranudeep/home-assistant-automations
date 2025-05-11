define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConfiguration = getConfiguration;
    function getConfiguration() {
        let restHostURL = window.APP_REST_REQUESTS_HOST;
        let config = {};
        restHostURL = `http://${window.location.hostname}:${window.location.port}`;
        if (!restHostURL) {
            restHostURL = "http://localhost:8089";
        }
        config.hostName = restHostURL;
        return config;
    }
});
