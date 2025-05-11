import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketEventListener } from "../home-assistant-event-listener/WebsocketEventListener"
import { SwitchBinder } from '../switches-binder/SwitchBinder';
import { Module } from '@nestjs/common';
import { IptvModule } from '../apis/IptvModule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [EventEmitterModule.forRoot(),IptvModule,
  ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','..', 'public','ui'),
      serveRoot: '/ui', // Oracle JET will be served under /ui/
    }),],
  providers: [WebsocketEventListener, SwitchBinder],
})
export class AppModule {}