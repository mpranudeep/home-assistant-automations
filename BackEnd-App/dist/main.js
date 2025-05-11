"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const AppModule_1 = require("./server/AppModule");
const Constants_1 = __importDefault(require("./common/Constants"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule_1.AppModule);
    await app.listen(Constants_1.default.WEB_PORT);
}
bootstrap();
