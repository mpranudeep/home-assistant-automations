
export type Configuration = {
    hostName: string
}

export function getConfiguration(): Configuration {
    // @ts-ignore

    let restHostURL = window.APP_REST_REQUESTS_HOST;
    let config: any = {};

    // @ts-ignore
    restHostURL = `http://${window.location.hostname}:${window.location.port}`;

    if (!restHostURL) {
        restHostURL = "http://localhost:8089"
    }
    config.hostName = restHostURL;
    return config;
}

