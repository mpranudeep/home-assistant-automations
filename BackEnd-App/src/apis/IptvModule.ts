import { Module } from '@nestjs/common';
import {IptvController} from "./IptvController"

@Module({
    controllers: [IptvController],
  })
export class IptvModule{

}