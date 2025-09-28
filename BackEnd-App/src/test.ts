import { textSpanContainsPosition } from "typescript";
import PageContentReader from "./page-content-reader/PageContentReader";
import { PiperManager } from "./tts/piper-manager";


async function test(){
    let p = new PageContentReader();
    // console.log('Final response -> ' + await p.callOllama('Hello !!'));
}

test();

