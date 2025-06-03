"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const event_emitter_1 = require("@nestjs/event-emitter");
const WebsocketEventListener_1 = require("../home-assistant-event-listener/WebsocketEventListener");
const SwitchBinder_1 = require("../switches-binder/SwitchBinder");
const common_1 = require("@nestjs/common");
const IptvModule_1 = require("../apis/IptvModule");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const PageContentReaderModule_1 = __importDefault(require("../page-content-reader/PageContentReaderModule"));
const tts_module_1 = __importDefault(require("../tts/tts.module"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule.forRoot(), IptvModule_1.IptvModule, PageContentReaderModule_1.default, tts_module_1.default,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', '..', '..', 'FrontEnd-App', 'web'),
                serveRoot: '/ui', // Oracle JET will be served under /ui/
            })],
        providers: [WebsocketEventListener_1.WebsocketEventListener, SwitchBinder_1.SwitchBinder],
    })
], AppModule);
