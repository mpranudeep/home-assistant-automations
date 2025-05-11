import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HaStateChangedEvent } from '../home-assistant-event-listener/HaStateChangedEvent';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import Constants from '../common/Constants';
import { config } from 'dotenv';

@Injectable()
export class SwitchBinder {
  private readonly logger = new Logger(SwitchBinder.name);
  
  private readonly syncPairs: { masterSwitch: string, replicaSwitches: string[] }[] = [];


  constructor() {
    
    let configPath = Constants.HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE;
    configPath = path.resolve(configPath);
    this.logger.debug(`Switch bind path ${configPath}`);
    const raw = fs.readFileSync(configPath, 'utf-8');
    this.syncPairs = JSON.parse(raw);
    //this.syncAllStatesOnStartup();
  }

  async syncAllStatesOnStartup() {
    for (const { masterSwitch, replicaSwitches } of this.syncPairs) {
      const state = await this.getCurrentState(masterSwitch);
      if (state === undefined) continue;
  
      // Sync each replica switch to the master switch state
      await this.syncTo(masterSwitch, replicaSwitches, state);
    }
  
    this.logger.log('🔁 Initial state sync complete');
  }
  


    @OnEvent('ha.state_changed')
    async handleStateChange(event: HaStateChangedEvent) {
      const source = event.entityId;
      const newState = event.newState?.state;

      for (const { masterSwitch, replicaSwitches } of this.syncPairs) {
        // If the source is the master switch, sync all replicas to the new state
        if (source === masterSwitch) {
          await this.syncTo(masterSwitch, replicaSwitches, newState);
        }

        // If the source is one of the replica switches, sync the master switch to its state
        if (replicaSwitches.includes(source)) {
          this.logger.log(`One of the replica switches state is change ${source}`);
          let switchesToBeSynched = replicaSwitches;
          switchesToBeSynched = switchesToBeSynched.filter(item=>item!=source);
          switchesToBeSynched.push(masterSwitch);

          await this.syncTo(source, switchesToBeSynched, newState);
        }
      }
    }

  private async getCurrentState(entityId: string): Promise<string | undefined> {
    const url = `http://${Constants.HOME_ASSISTANT_URL}/api/states/${entityId}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${Constants.HOME_ASSISTANT_TOKEN}`,
        },
      });
      return response.data.state;
    } catch (err) {
      // @ts-ignore
      this.logger.error(`❌ Failed to fetch state for ${entityId}: ${err.message}`);
      return undefined;
    }
  }

  private async syncTo(masterSwitch: string, replicaSwitches: string[], state: string) {
    // Get current state of master switch
    const currentState = await this.getCurrentState(masterSwitch);
    if (currentState === undefined) {
      this.logger.warn(`Could not fetch current state for ${masterSwitch}`);
      return;
    }
  
    // Iterate over each replica switch and sync them
    for (const replicaSwitch of replicaSwitches) {
      const replicaState = await this.getCurrentState(replicaSwitch);
      if (replicaState === undefined) {
        this.logger.warn(`Could not fetch current state for ${replicaSwitch}`);
        continue;
      }
  
      if (replicaState !== state) {
        await this.syncSingleSwitch(replicaSwitch, state);
      }
    }
  }
  
  private async syncSingleSwitch(entityId: string, state: string) {
    const [domain] = entityId.split('.');
  
    let service: string;
    let payload: any = { entity_id: entityId };
  
    if (domain === 'input_boolean' || domain === 'switch') {
      service = state === 'on' ? 'turn_on' : 'turn_off';
    } else if (domain === 'input_button') {
      service = 'press';
    } else {
      this.logger.log(`Unsupported domain: ${domain}`);
      // return;
      service=domain;
    }
  
    const url = `http://${Constants.HOME_ASSISTANT_URL}/api/services/${domain}/${service}`;
  
    try {
      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${Constants.HOME_ASSISTANT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log(`🔁 Synced ${entityId} via ${domain}.${service}`);
    } catch (err) {
      //@ts-ignore
      this.logger.error(`❌ Failed to sync ${entityId}: ${err.message}`);
    }
  }
  

}
