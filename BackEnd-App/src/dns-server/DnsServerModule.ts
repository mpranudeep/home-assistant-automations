import { Module } from "@nestjs/common";
import { DnsServerService } from "./DnsServerService";



@Module({
    providers: [DnsServerService],
})
export default class DnsServerModule {

}