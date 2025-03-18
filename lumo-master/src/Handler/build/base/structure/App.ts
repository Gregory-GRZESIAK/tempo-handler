import { Client, RESTPostAPIChatInputApplicationCommandsJSONBody, Events, Routes, REST } from 'discord.js';
import { AppIntents, AppOptions } from './options/AppOptions.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { build } from '../utils/main.js';
import { Command, SlashCommandBuilderOptions, MessageCommandBuilderOptions, Event } from '../interfaces/main.js';
import { ConsoleMessage } from '../components/ConsoleMessage.js';

export class App extends Client implements AppOptions {
    intents?: AppIntents.All | AppIntents[] | undefined;
    commands: Map<string, Command<SlashCommandBuilderOptions | MessageCommandBuilderOptions>>;
    slash: RESTPostAPIChatInputApplicationCommandsJSONBody[]
    token: string;
    clientId: string;
    constructor(options: AppOptions = {}) {
        const { intents = [] } = options;

        const intentsValue = Array.isArray(intents)
            ? intents.reduce((acc, intent) => {
                if (App.isValidIntent(intent)) {
                    return acc | intent;
                } else {
                    throw new Error(`Invalid intent: ${intent}`);
                }
            }, 0)
            : App.isValidIntent(intents)
                ? intents
                : (() => {
                    throw new Error(`Invalid intent: ${intents}`);
                })();

        super({ intents: [intentsValue] });

        this.intents = intents;
        this.commands = new Map();
        this.slash = [];
        this.token = process.env.TOKEN || '';
        this.clientId = process.env.CLIENT_ID || '';
        this.login(this.token);
        this.on(Events.ClientReady, async (client) => {
            new ConsoleMessage('Success', `${client.user?.tag} is now online !`);
            await this.loadModules();
            await this.loadSlashCommands();
        })
    }
    static isValidIntent(intent: number): boolean {
        return Object.values(AppIntents).includes(intent);
    }
    private async loadSlashCommands(): Promise<void> {
        await this.destroyCommands();
        await this.deployCommands();
    }
    private async destroyCommands(): Promise<void> {
        const guilds = this.guilds.cache;
        for (const guild of guilds.values()) {
            try {
                await guild.commands.set([]);
            } catch (e) {
                new ConsoleMessage('Error', `An error occured while destroying the olds commands.`);
            }
        }
    }
    private async deployCommands(): Promise<void> {
        const rest = new REST().setToken(this.token ?? 'error');
        (async () => {
            try {
                await rest.put(
                    Routes.applicationCommands(`${this.clientId}`),
                    { body: this.slash },
                );
                new ConsoleMessage('Success', `Successfully deployed ${this.slash.length} slash commands.`);
            } catch (error) {
                new ConsoleMessage('Error', `Failed to deploy slash commands.`);
            }
        })();
    }
    private async loadModules(dir: string = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../modules')): Promise<void> {
        const modules = fs.readdirSync(dir);
        const terminalLength = process.stdout.columns || 80;
        const drawLine = (char = '-') => console.log(char.repeat(terminalLength));
        drawLine();
        const title = 'Powered by Lumo'
        const subtitle = 'This code is the property of Lumo, licensed and protected. Selling or distributing it is strictly prohibited and may result in legal consequences.';
        const splitSubtitle = (subtitle: string) => {
            const lines: string[] = [];
            while (subtitle.length > terminalLength) {
                let sliceIndex = subtitle.lastIndexOf(' ', terminalLength);
                if (sliceIndex === -1) sliceIndex = terminalLength;
                lines.push(subtitle.slice(0, sliceIndex).trim());
                subtitle = subtitle.slice(sliceIndex).trim();
            }
            lines.push(subtitle);
            return lines;
        };
        console.log(' '.repeat((terminalLength - title.length) / 2) + title);
        const subtitleLines = splitSubtitle(subtitle);
        subtitleLines.forEach(line => {
            console.log(' '.repeat(Math.max(0, (terminalLength - line.length) / 2)) + line);
        });
        console.log('\n');
        var i = 0;
        for (const module of modules) {
            i++;
            const modulePath = path.join(dir, module);
            const files = fs.readdirSync(modulePath).filter(file => file.endsWith('.json'));
            const moduleData = files.filter(file => file === 'module.json')[0];
            const moduleDataPath = path.join(modulePath, moduleData);
            const data = JSON.parse(fs.readFileSync(moduleDataPath, 'utf-8'));
            const name = data.name;
            const version = data.version;

            await this.loadCommands(path.join(modulePath, 'build', 'commands'));
            await this.loadEvents(path.join(modulePath, 'build', 'events'));
            console.log(' '.repeat(5) + '\u001b[' + 32 + 'm' + `[${i}]` + '\u001b[0m' + ` ${name} ` + '\u001b[' + 32 + 'm' + `(${version})` + '\u001b[0m');
        }
        drawLine();
    }

    private async loadCommands(dir: string): Promise<void> {
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const filePath = path.join(dir, file);
            const fileURL = pathToFileURL(filePath).href;
            try {
                const command = await import(fileURL);
                if ('options' in command.default && 'execute' in command.default) {
                    if (command.default.options.hasOwnProperty('slash') && command.default.options.slash === true) {
                        const cmd = command.default as Command<SlashCommandBuilderOptions>;
                        if (!cmd.options.cooldown) cmd.options.cooldown = 5;
                        this.commands.set(cmd.options.name, cmd);
                        const slash = await build(cmd.options);
                        this.slash.push(slash);
                    } else {
                        const cmd = command.default as Command<MessageCommandBuilderOptions>;
                        if (!cmd.options.cooldown) cmd.options.cooldown = 5;
                        this.commands.set(cmd.options.name, cmd);
                    }
                } else {
                    new ConsoleMessage('Warn', `The command: ${filePath} is missing a property "options" or "execute".`);
                }
            } catch (error) {
                new ConsoleMessage('Error', `Failed to load command at ${filePath}.`);
            }
        }
    }

    private async loadEvents(dir: string): Promise<void> {
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const filePath = path.join(dir, file);
            const fileURL = pathToFileURL(filePath).href;
            try {
                const event = await import(fileURL);
                const evt = event.default as Event<'messageCreate'>;
                this.on(evt.options.name, (...args) => evt.execute(...args));
            } catch (error) {
                new ConsoleMessage('Error', `Failed to load event at ${filePath}.`);
            }
        }
    }

}
