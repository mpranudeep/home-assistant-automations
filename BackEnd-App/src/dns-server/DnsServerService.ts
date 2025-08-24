import { Logger, OnModuleInit } from "@nestjs/common";
import Constants from "../common/Constants";
import dotenv from "dotenv";

const dns = require('native-dns');
const ARecord = dns.A;
const Request = dns.Request;
const ServerRequest = dns.ServerRequest;
const ServerResponse = dns.ServerResponse;
const DNS_PORT = 53;
const PIHOLE_DNS_IP = '192.168.68.120';
const PIHOLE_DNS_PORT = 5300;

dotenv.config();

// NOTE: Run this command for the below server to work 
// sudo setcap 'cap_net_bind_service=+ep' $(which node)

export class DnsServerService implements OnModuleInit {

    private readonly log: Logger = new Logger(DnsServerService.name);


    constructor() { }

    async onModuleInit() {
        await this.startDNSServer();
    }

    private async startDNSServer() {


        const isLan = (ip: string) => ip.startsWith('192.168.');
        const isTailscale = (ip: string) =>
            ip.startsWith('100.');

        const dnsServer = dns.createServer();

        dnsServer.on('request', (req: any, res: any) => {
            const question = req.question[0];
            const domain = question.name.toLowerCase();
            const clientIp = req.address.address;

            if (clientIp === '192.168.68.120') {
                // this.log.debug(`[DNS] Request for ${domain} from Pi-hole itself, forwarding to public DNS`);

                const publicDnsRequest = dns.Request({
                    question: req.question[0], // reuse the same question
                    server: { address: '8.8.8.8', port: 53, type: 'udp' }, // or 1.1.1.1
                    timeout: 2000
                });

                // @ts-ignore
                publicDnsRequest.on('message', (err, answer) => {
                    if (err) {
                        this.log.error(`[DNS] Error forwarding to public DNS: ${err.message}`);
                    } else {
                        // @ts-ignore
                        answer.answer.forEach((a) => res.answer.push(a));
                    }
                    res.send();
                });

                publicDnsRequest.on('timeout', () => {
                    this.log.error('[DNS] Public DNS request timed out');
                    res.send();
                });

                publicDnsRequest.send();
                return;
            }

            if (domain.endsWith('.homeserver.com') || domain == 'homeserver.com') {
                const ip = isLan(clientIp) ? '192.168.68.120' : '100.73.206.116';

                const answer = dns.A({
                    name: domain,
                    address: ip,
                    ttl: 60,
                });
                this.log.debug(`[DNS] ${clientIp} requested ${domain}- forwarded to Local DNS ${ip}`);
                res.answer.push(answer);
                res.send();
            } else {
                // Forward to Pi-hole
                const fwd = Request({
                    question,
                    server: { address: PIHOLE_DNS_IP, port: PIHOLE_DNS_PORT, type: 'udp' },
                    timeout: 1000,
                });

                // @ts-ignore
                fwd.on('message', (_err, msg) => {
                    // @ts-ignore
                    msg.answer.forEach((a) => res.answer.push(a));
                    res.send();
                });

                fwd.on('timeout', () => {
                    // this.log.warn(`[DNS] Timeout querying Pi-hole for ${domain}`);
                    res.send();
                });

                // this.log.debug(`[DNS] ${clientIp} requested ${domain}- fwded to pihole DNS`);
                fwd.send();
            }
        });

        // @ts-ignore
        dnsServer.on('error', (err) => console.error('[DNS ERROR]', err));

        dnsServer.serve(DNS_PORT, '0.0.0.0');
        this.log.debug(`[DNS] Proxy server listening on UDP port ${DNS_PORT}`);

    }
}