import { textSpanContainsPosition } from "typescript";
import PageContentReader from "./page-content-reader/PageContentReader";


async function test(){
    let p = new PageContentReader();
    // await p.googleTranslateText(["你好，世界"]);
    let r = await p.scrapeAndProcessContent("https://wtr-lab.com/en/novel/8323/rise-of-empires-spain/chapter-1&spellCorrectEnabled=false",false);
    
    console.log(JSON.stringify(r));
    // console.log(r);
    // let pm = new PiperManager();
    // await pm.init();
    // await pm.speakText("Hello, world! This is a test of the Piper text to speech system.");
}

test();

