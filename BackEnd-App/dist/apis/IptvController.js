"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var IptvController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IptvController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const Constants_1 = __importDefault(require("../common/Constants"));
const common_2 = require("@nestjs/common");
let IptvController = IptvController_1 = class IptvController {
    constructor() {
        this.logger = new common_2.Logger(IptvController_1.name);
    }
    async getPlaylist(res) {
        try {
            let url = `${Constants_1.default.JIO_TV_URL}/playlist.m3u?l=Hindi,Telugu,English`;
            this.logger.debug(`Redirecting to ${url}`);
            const response = await axios_1.default.get(url, { responseType: 'text' });
            let content = response.data;
            res.setHeader('Content-Type', 'audio/x-mpegurl');
            return res.send(content);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send('Failed to fetch or parse playlist.');
        }
    }
};
exports.IptvController = IptvController;
__decorate([
    (0, common_1.Get)('iptv/halltv.m3u'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IptvController.prototype, "getPlaylist", null);
exports.IptvController = IptvController = IptvController_1 = __decorate([
    (0, common_1.Controller)()
], IptvController);
