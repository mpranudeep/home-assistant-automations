import { textSpanContainsPosition } from "typescript";
import PageContentReader from "./page-content-reader/PageContentReader";
import { PiperManager } from "./tts/piper-manager";


async function test(){
    let p = new PiperManager();
    await p.onModuleInit();
    p.speakToFile("Hello world");
}

test();

