import { Controller, Injectable } from "@nestjs/common";
import { Logger } from '@nestjs/common';

@Controller('my-logi-flow')
export default class MyLogiFlowController {
    private readonly logger = new Logger(MyLogiFlowController.name);

    constructor(){
        
    }
}