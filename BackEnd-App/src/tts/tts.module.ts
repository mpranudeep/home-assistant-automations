import { Module } from "@nestjs/common";
import { TtsController } from "./tts.controller";
import { PiperManager } from "./piper-manager";

@Module({
    controllers: [TtsController],
    providers : [PiperManager]
  })
export default class TTSModule{

}