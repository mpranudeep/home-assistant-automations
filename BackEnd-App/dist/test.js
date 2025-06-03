"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const piper_manager_1 = require("./tts/piper-manager");
async function test() {
    let p = new piper_manager_1.PiperManager();
    await p.onModuleInit();
    p.speakToFile("Hello world");
}
test();
