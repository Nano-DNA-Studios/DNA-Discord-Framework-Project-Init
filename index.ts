#!/usr/bin/env node
import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

const projectName = process.argv[2];
if (!projectName) {
    console.log('Please specify the project directory:');
    console.log('  npx my-create-ts-app <project-name>');
    process.exit(1);
}

const root = path.resolve(projectName);
const templateDir = path.join(__dirname, './template');

try {
    fs.mkdirSync(root);
    fs.copySync(templateDir, root);

    const dataManagerPath = path.join(root, `src/${projectName}DataManager.ts`);
    const helloCommandPath = path.join(root, `src/Commands/HelloWorld.ts`);

    fs.writeFileSync(dataManagerPath, DataManagerText(projectName))
    fs.writeFileSync(path.join(root, 'index.ts'), IndexText(projectName))
    fs.writeFileSync(helloCommandPath, HelloWorldText());

    execSync('npm install typescript -y', { cwd: root, stdio: 'inherit' });
    execSync('npm init typescript -y', { cwd: root, stdio: 'inherit' });

    fs.writeFileSync(path.join(root, 'package.json'), PackageJSONText(projectName));
    fs.writeFileSync(path.join(root, 'tsconfig.json'), TSConfigText());
    fs.writeFileSync(path.join(root, '.gitignore'), GitIgnoreText());

    execSync('npm install dna-discord-framework', { cwd: root, stdio: 'inherit' });
    execSync('npm install --save-dev @types/ssh2', { cwd: root, stdio: 'inherit' });
    execSync('npm install', { cwd: root, stdio: 'inherit' });
    execSync('npm run build', { cwd: root, stdio: 'inherit' });

    fs.removeSync(path.join(root, 'src/index.ts'));
    fs.removeSync(path.join(root, 'src/index.js'));

    console.log(`Project created at ${root}`);

    execSync('git init', { cwd: root, stdio: 'inherit' });

} catch (error) {
    console.error(`Failed to create project: ${error}`);
    process.exit(1);
}

/**
 * Creates a new Data Manager for the Project
 * @param projectName The Name of the project
 * @returns The Text for the Data Manager class
 */
function DataManagerText(projectName: string): string {
    return `import { BotDataManager } from "dna-discord-framework";

class ${projectName}DataManager extends BotDataManager
{
    
}
    
export default ${projectName}DataManager;`;
}

/**
 * Creates the Index.ts file for the project
 * @param projectName The Name of the project
 * @returns The Text for the Index.ts file
 */
function IndexText(projectName: string): string {
    return `import { DiscordBot } from "dna-discord-framework";
import ${projectName}DataManager from "./src/${projectName}DataManager";
    
const Bot = new DiscordBot(${projectName}DataManager);

Bot.StartBot();

console.log("Bot Started");`;
}

/**
 * Creates the TSConfig.json file for the project 
 * @returns The Text for the TSConfig.json file
 */
function TSConfigText(): string {
    return `{
    "compilerOptions": {
      "target": "ES2020",  // Support for BigInt and other newer features
      "module": "commonjs",
      "strict": true,
      "esModuleInterop": true,  // Allows default imports from modules without default exports
      "skipLibCheck": true,  // This can help avoid errors in .d.ts files if they are not crucial
    },
   
  }
    `
}

/**
 * Creates the Package.json file for the project
 * @param projectName The Name of the project
 * @returns The Text for the Package.json file
 */
function PackageJSONText(projectName: string): string {
    return `{
"name": "${projectName.toLowerCase()}",
"version": "1.0.0",
"main": "./index.js",
"dependencies": {
    "dna-discord-framework": "^1.0.98",
    "tslint": "^6.1.3",
    "typescript": "^5.4.5"
},
"scripts": {
    "build": "tsc",
    "start": "npm run build && node index.js"
},
"keywords": [],
"author": "",
"license": "ISC",
"description": "",
"devDependencies": {
    "@types/ssh2": "^1.15.0"
}
}`;
}

/**
 * Creates the GitIgnore file for the project
 * @returns The Text for the GitIgnore file
 */
function GitIgnoreText(): string {
    return `
node_modules
Resources
.env
    `;
}

/**
 * Creates the HelloWorld.ts file for the project
 * @returns The Text for the HelloWorld.ts file
 */
function HelloWorldText(): string {
    return `import { Client, ChatInputCommandInteraction, CacheType } from "discord.js";
import { BotDataManager, Command } from "dna-discord-framework";

class HelloWorld extends Command {

    /* <inheritdoc> */
    public CommandName: string = 'helloworld';

    /* <inheritdoc> */
    public CommandDescription: string = 'A simple Hello World Command';

    /* <inheritdoc> */
    public RunCommand = async (client: Client<boolean>, interaction: ChatInputCommandInteraction<CacheType>, BotDataManager: BotDataManager) => {
        this.InitializeUserResponse(interaction, "Hello World!");
    };

    /* <inheritdoc> */
    public IsEphemeralResponse: boolean = false;
}

export = HelloWorld;`;
}