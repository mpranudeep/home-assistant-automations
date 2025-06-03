import { readJson, writeFile } from 'fs-extra';
import { stringify } from 'yaml';

interface TuyaDevice {
  id: string;
  key: string;
  name: string;
  ip?: string; // Some may not have IPs
  ver:string;
  dps?:any;
}

interface LocalTuyaEntity {
  platform: string;
  friendly_name: string;
  id: number;
}

interface LocalTuyaDevice {
  host: string;
  device_id: string;
  local_key: string;
  protocol_version: string;
  friendly_name: string;
  entities: LocalTuyaEntity[];
}

async function convertTuyaJsonToYaml(inputPath: string, outputPath: string) {
 let fileInputContent =  await readJson(inputPath);
  const devices: TuyaDevice[] = fileInputContent.devices || [];
  const localtuya: LocalTuyaDevice[] = [];

  for (const device of devices) {
    if (!device.ip) {
      console.warn(`⚠️ Skipping ${device.name} (${device.id}): Missing IP`);
      continue;
    }

    const localDevice: LocalTuyaDevice = {
      host: device.ip,
      device_id: device.id,
      local_key: device.key,
      protocol_version: device.ver || '3.3',
      friendly_name: device.name || device.id,
      entities: []
    };

    let dps = device?.dps?.dps || {};

    let dpsKeys = Object.keys(dps);
    
    for (let i = 1; i <= dpsKeys.length; i++) {
      localDevice.entities.push({
        platform: "switch",
        friendly_name: `Switch ${i}`,
        id: i
      });
    }

    localtuya.push(localDevice);
  }

  const config = { localtuya };
  const yamlOutput = stringify(config);

  await writeFile(outputPath, yamlOutput, 'utf8');
  console.log(`✅ YAML written to ${outputPath}`);
}

convertTuyaJsonToYaml('/home/mpranudeep/snapshot.json', 'configuration.yaml').catch(console.error);
