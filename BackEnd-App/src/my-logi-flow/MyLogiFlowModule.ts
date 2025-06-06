import { Module } from '@nestjs/common';
import MyLogiFlowController from './MyLogiFlowController';
import MyLogiFlowService from './MyLogiFlowService';


@Module({
    controllers: [MyLogiFlowController],
    providers: [MyLogiFlowService]
  })
export default class MyLogiFlowModule{

}