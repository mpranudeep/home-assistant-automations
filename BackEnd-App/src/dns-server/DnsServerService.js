"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsServerService = void 0;
var common_1 = require("@nestjs/common");
var dotenv_1 = require("dotenv");
var dns = require('native-dns');
var ARecord = dns.A;
var Request = dns.Request;
var ServerRequest = dns.ServerRequest;
var ServerResponse = dns.ServerResponse;
var DNS_PORT = 53;
var PIHOLE_DNS_IP = '192.168.68.120';
var PIHOLE_DNS_PORT = 5300;
dotenv_1.default.config();
// NOTE: Run this command for the below server to work 
// sudo setcap 'cap_net_bind_service=+ep' $(which node)
var DnsServerService = /** @class */ (function () {
    function DnsServerService() {
        this.log = new common_1.Logger(DnsServerService.name);
    }
    DnsServerService.prototype.onModuleInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.startDNSServer()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DnsServerService.prototype.startDNSServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isLan, isTailscale, dnsServer;
            var _this = this;
            return __generator(this, function (_a) {
                isLan = function (ip) { return ip.startsWith('192.168.'); };
                isTailscale = function (ip) {
                    return ip.startsWith('100.');
                };
                dnsServer = dns.createServer();
                dnsServer.on('request', function (req, res) {
                    var question = req.question[0];
                    var domain = question.name.toLowerCase();
                    var clientIp = req.address.address;
                    if (clientIp === '192.168.68.120') {
                        // this.log.debug(`[DNS] Request for ${domain} from Pi-hole itself, forwarding to public DNS`);
                        var publicDnsRequest = dns.Request({
                            question: req.question[0], // reuse the same question
                            server: { address: '8.8.8.8', port: 53, type: 'udp' }, // or 1.1.1.1
                            timeout: 2000
                        });
                        // @ts-ignore
                        publicDnsRequest.on('message', function (err, answer) {
                            if (err) {
                                _this.log.error("[DNS] Error forwarding to public DNS: ".concat(err.message));
                            }
                            else {
                                // @ts-ignore
                                answer.answer.forEach(function (a) { return res.answer.push(a); });
                            }
                            res.send();
                        });
                        publicDnsRequest.on('timeout', function () {
                            _this.log.error('[DNS] Public DNS request timed out');
                            res.send();
                        });
                        publicDnsRequest.send();
                        return;
                    }
                    if (domain.endsWith('.homeserver.com') || domain == 'homeserver.com') {
                        var ip = isLan(clientIp) ? '192.168.68.120' : '100.73.206.116';
                        var answer = dns.A({
                            name: domain,
                            address: ip,
                            ttl: 60,
                        });
                        _this.log.debug("[DNS] ".concat(clientIp, " requested ").concat(domain, "- forwarded to Local DNS ").concat(ip));
                        res.answer.push(answer);
                        res.send();
                    }
                    else {
                        // Forward to Pi-hole
                        var fwd = Request({
                            question: question,
                            server: { address: PIHOLE_DNS_IP, port: PIHOLE_DNS_PORT, type: 'udp' },
                            timeout: 1000,
                        });
                        // @ts-ignore
                        fwd.on('message', function (_err, msg) {
                            // @ts-ignore
                            msg.answer.forEach(function (a) { return res.answer.push(a); });
                            res.send();
                        });
                        fwd.on('timeout', function () {
                            // this.log.warn(`[DNS] Timeout querying Pi-hole for ${domain}`);
                            res.send();
                        });
                        // this.log.debug(`[DNS] ${clientIp} requested ${domain}- fwded to pihole DNS`);
                        fwd.send();
                    }
                });
                // @ts-ignore
                dnsServer.on('error', function (err) { return console.error('[DNS ERROR]', err); });
                dnsServer.serve(DNS_PORT, '0.0.0.0');
                this.log.debug("[DNS] Proxy server listening on UDP port ".concat(DNS_PORT));
                return [2 /*return*/];
            });
        });
    };
    return DnsServerService;
}());
exports.DnsServerService = DnsServerService;
