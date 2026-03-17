import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';

type WyomingEvent = {
  type: string;
  version?: string;
  data?: Record<string, any>;
  data_length?: number;
  payload_length?: number;
};

@Injectable()
export class PiperManager {
  private readonly logger = new Logger(PiperManager.name);
  private readonly host = '192.168.68.120';
  private readonly port = 5021;

  async speak(text: string): Promise<Buffer> {
    const pcm = await this.synthesizeViaWyoming(text);
    return this.pcmToWav(pcm.audioBuffer, pcm.sampleRate, pcm.channels, pcm.sampleWidth);
  }

  private async synthesizeViaWyoming(text: string): Promise<{ audioBuffer: Buffer; sampleRate: number; channels: number; sampleWidth: number }> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.host, port: this.port });
      let settled = false;

      let streamBuffer = Buffer.alloc(0);
      let currentEvent: WyomingEvent | null = null;
      let currentDataLength = 0;
      let currentPayloadLength = 0;

      const audioChunks: Buffer[] = [];
      let sampleRate = 22050;
      let channels = 1;
      let sampleWidth = 2;

      const cleanup = () => {
        socket.removeAllListeners();
        socket.end();
        socket.destroy();
      };

      const normalizeSampleWidthBytes = (value: unknown, fallback: number): number => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
        // Some implementations may report bits (e.g. 16) instead of bytes (e.g. 2).
        if (parsed > 8) return Math.max(1, Math.round(parsed / 8));
        return parsed;
      };

      socket.on('connect', () => {
        const dataBuffer = Buffer.from(JSON.stringify({ text }), 'utf8');
        const message: WyomingEvent = {
          type: 'synthesize',
          data_length: dataBuffer.length,
          payload_length: 0,
        };
        socket.write(Buffer.concat([Buffer.from(`${JSON.stringify(message)}\n`, 'utf8'), dataBuffer]));
      });

      socket.on('data', (chunk: Buffer) => {
        streamBuffer = Buffer.concat([streamBuffer, chunk]);

        while (true) {
          if (!currentEvent) {
            const newlineIndex = streamBuffer.indexOf(0x0a);
            if (newlineIndex === -1) break;

            const rawHeader = streamBuffer.slice(0, newlineIndex).toString('utf8').trim();
            streamBuffer = streamBuffer.slice(newlineIndex + 1);

            if (!rawHeader) continue;

            try {
              currentEvent = JSON.parse(rawHeader) as WyomingEvent;
            } catch (error) {
              cleanup();
              settled = true;
              reject(new Error(`Invalid Wyoming header: ${rawHeader}`));
              return;
            }

            currentDataLength = currentEvent.data_length ?? 0;
            currentPayloadLength = currentEvent.payload_length ?? 0;
          }

          if (!currentEvent) break;
          if (streamBuffer.length < currentDataLength + currentPayloadLength) break;

          if (currentDataLength > 0) {
            const rawData = streamBuffer.slice(0, currentDataLength).toString('utf8').trim();
            streamBuffer = streamBuffer.slice(currentDataLength);

            if (rawData) {
              try {
                currentEvent.data = JSON.parse(rawData) as Record<string, any>;
              } catch (error) {
                cleanup();
                settled = true;
                reject(new Error(`Invalid Wyoming data JSON: ${rawData}`));
                return;
              }
            }
          }

          let payload = Buffer.alloc(0);
          if (currentPayloadLength > 0) {
            payload = streamBuffer.slice(0, currentPayloadLength);
            streamBuffer = streamBuffer.slice(currentPayloadLength);
          }

          if (currentEvent.type === 'audio-start') {
            sampleRate = Number(currentEvent.data?.rate ?? sampleRate);
            channels = Number(currentEvent.data?.channels ?? channels);
            sampleWidth = normalizeSampleWidthBytes(currentEvent.data?.width, sampleWidth);
          } else if (currentEvent.type === 'audio-chunk') {
            // Keep format updated from chunk metadata if provided.
            sampleRate = Number(currentEvent.data?.rate ?? sampleRate);
            channels = Number(currentEvent.data?.channels ?? channels);
            sampleWidth = normalizeSampleWidthBytes(currentEvent.data?.width, sampleWidth);
            if (payload.length > 0) {
              audioChunks.push(payload);
            }
          } else if (currentEvent.type === 'audio-stop') {
            cleanup();
            settled = true;
            resolve({
              audioBuffer: Buffer.concat(audioChunks),
              sampleRate,
              channels,
              sampleWidth,
            });
            return;
          } else if (currentEvent.type === 'error') {
            cleanup();
            settled = true;
            reject(new Error(`Wyoming error: ${JSON.stringify(currentEvent.data ?? {})}`));
            return;
          }

          currentEvent = null;
          currentDataLength = 0;
          currentPayloadLength = 0;
        }
      });

      socket.on('error', (error) => {
        if (settled) return;
        cleanup();
        settled = true;
        reject(error);
      });

      socket.on('end', () => {
        if (settled) return;
        if (audioChunks.length === 0) {
          settled = true;
          reject(new Error('Wyoming server closed connection without audio output'));
          return;
        }

        settled = true;
        resolve({
          audioBuffer: Buffer.concat(audioChunks),
          sampleRate,
          channels,
          sampleWidth,
        });
      });
    });
  }

  private pcmToWav(pcm: Buffer, sampleRate: number, channels: number, sampleWidth: number): Buffer {
    const blockAlign = channels * sampleWidth;
    const byteRate = sampleRate * blockAlign;
    const wavHeader = Buffer.alloc(44);

    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(36 + pcm.length, 4);
    wavHeader.write('WAVE', 8);
    wavHeader.write('fmt ', 12);
    wavHeader.writeUInt32LE(16, 16);
    wavHeader.writeUInt16LE(1, 20);
    wavHeader.writeUInt16LE(channels, 22);
    wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(byteRate, 28);
    wavHeader.writeUInt16LE(blockAlign, 32);
    wavHeader.writeUInt16LE(sampleWidth * 8, 34);
    wavHeader.write('data', 36);
    wavHeader.writeUInt32LE(pcm.length, 40);

    return Buffer.concat([wavHeader, pcm]);
  }
}
