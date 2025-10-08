import { textSpanContainsPosition } from "typescript";
import PageContentReader from "./page-content-reader/PageContentReader";
import { PiperManager } from "./tts/piper-manager";


async function test(){
    let p = new PageContentReader();
    // await p.googleTranslateText(["你好，世界"]);
    let r = await p.getReadableContent("https://www.69shuba.com/txt/46951/32460649");
    // console.log(r);
    // let pm = new PiperManager();
    // await pm.init();
    // await pm.speakText("Hello, world! This is a test of the Piper text to speech system.");
}

test();

