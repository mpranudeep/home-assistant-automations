"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const imageName = 'homeassistant.local:5000/my-assistant-automations';
const imageTag = 'latest';
const fullImageName = `${imageName}:${imageTag}`;
function runCommand(command) {
    try {
        (0, child_process_1.execSync)(command, { stdio: 'inherit' });
    }
    catch (error) {
        console.warn(`Command failed: ${command}`);
    }
}
function publishImage() {
    console.log(`🔍 Removing old image: ${fullImageName}`);
    runCommand(`docker rmi -f ${fullImageName}`);
    console.log(`📦 Building and publish new image: ${fullImageName}`);
    runCommand(`docker buildx build --push -t ${fullImageName} .`);
    console.log(`✅ Done.`);
}
publishImage();
