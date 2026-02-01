import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketEventListener } from "../home-assistant-event-listener/WebsocketEventListener"
import { SwitchBinder } from '../switches-binder/SwitchBinder';
import { Module } from '@nestjs/common';
import { IptvModule } from '../apis/IptvModule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import PageContentReaderModule from '../page-content-reader/PageContentReaderModule';
import TTSModule from '../tts/tts.module';
import DnsServerModule from '../dns-server/DnsServerModule';
import { NovelSourceModule } from '../apis/NovelSourceModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Novel } from '../apis/entities/Novel';
import { Source } from '../apis/entities/Source';
import { ChapterProgress } from '../apis/entities/ChapterProgress';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    IptvModule,
    PageContentReaderModule,
    TTSModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'FrontEnd-App', 'web'),
      serveRoot: '/ui', // Oracle JET will be served under /ui/
    }),
    DnsServerModule,
    // NovelSourceModule,
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: 'novel-embedded.sqlite',
    //   synchronize: true,
    //   logging: false,
    //   entities: [Novel, Source, ChapterProgress],
    // })
  ],
  providers: [WebsocketEventListener, SwitchBinder],
})
export class AppModule {}
