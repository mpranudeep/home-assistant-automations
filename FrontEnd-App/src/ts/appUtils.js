define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConfiguration = getConfiguration;
    function getConfiguration() {
        let restHostURL = window.APP_REST_REQUESTS_HOST;
        let config = {};
        if (!restHostURL) {
            restHostURL = `http://${window.location.hostname}`;
        }
        config.hostName = restHostURL;
        return config;
    }
});
