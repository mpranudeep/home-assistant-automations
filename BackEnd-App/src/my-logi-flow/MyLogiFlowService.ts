import { Injectable, OnModuleInit } from "@nestjs/common";
import { app, BrowserWindow, ipcMain, screen as electronScreen } from 'electron';
import { mouse, screen } from '@nut-tree-fork/nut-js';
import { Logger } from '@nestjs/common';
// @ts-ignore
import { getMonitorInfos, captureMonitorByIndex } from 'windows-ss';


@Injectable()
export default class MyLogiFlowService implements OnModuleInit {

    private readonly logger = new Logger(MyLogiFlowService.name);

    constructor() {

    }

    async detectMonitorAndEdge() {
        const infos = await getMonitorInfos(); // Array of monitor objects
        const pos = await mouse.getPosition();

        // @ts-ignore
        const idx = infos.findIndex(m =>
            // @ts-ignore
            pos.x >= m.left && pos.x < m.left + m.width && pos.y >= m.top && pos.y < m.top + m.height
        );
        if (idx === -1) return console.warn('Mouse not on any monitor');

        const mon = infos[idx];
        console.log(`Monitor #${idx}: deviceName=${mon.deviceName}`, mon);
        // @ts-ignore
        if (pos.x === mon.left) console.log('LEFT edge');
        // @ts-ignore
        else if (pos.x === mon.left + mon.width - 1) console.log('RIGHT edge');
        // @ts-ignore
        if (pos.y === mon.top) console.log('TOP edge');
        // @ts-ignore
        else if (pos.y === mon.top + mon.height - 1) console.log('BOTTOM edge');
    }

    onModuleInit() {
        this.logger.debug("MyLogiFlowService has been initialized.");
        setInterval(this.detectMonitorAndEdge, 100);
    }
}