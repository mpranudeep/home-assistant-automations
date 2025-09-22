"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PageContentReader_1 = __importDefault(require("./page-content-reader/PageContentReader"));
async function test() {
    let p = new PageContentReader_1.default();
    console.log('Final response -> ' + await p.callOllama('Hello !!'));
}
test();
