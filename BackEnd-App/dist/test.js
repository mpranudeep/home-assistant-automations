"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PageContentReader_1 = __importDefault(require("./novel-reader/PageContentReader"));
let reader = new PageContentReader_1.default();
reader.getReadableContent(`https://novelbin.com/b/online-game-god-level-assassin-i-am-the-shadow/chapter-1i-was-betrayed-by-my-sister-only-to-be-reborn`);
