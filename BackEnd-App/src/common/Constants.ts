import * as dotenv from 'dotenv';

dotenv.config();

export default class Constants{
    public static readonly HOME_ASSISTANT_URL:string = process.env.HOME_ASSISTANT_URL as string;
    public static readonly HOME_ASSISTANT_TOKEN = process.env.HOME_ASSISTANT_TOKEN as string;
    public static readonly HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE = process.env.HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE as string;
    public static readonly JIO_TV_URL = process.env.JIO_TV_URL as string;
    public static readonly WEB_PORT = process.env.WEB_PORT as string;
    public static readonly HOME_ASSISTANT_INTEGRATION_ENABLED = process.env.HOME_ASSISTANT_INTEGRATION_ENABLED as string;
}

console.log(JSON.stringify(Constants));