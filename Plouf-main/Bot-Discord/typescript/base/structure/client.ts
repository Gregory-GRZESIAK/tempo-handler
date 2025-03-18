import { GatewayIntentBits, Client as BaseClient, REST, Routes, Events, GuildTextBasedChannel, UserManager, ActivityType} from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises'

import * as dotenv from "dotenv";
dotenv.config({path:"../.env/"});

const token = process.env.TOKEN
const clientId = process.env.CLIENTID

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export class Client extends BaseClient {
    commands: Map<string, any>;
    slash: string[];

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildScheduledEvents,
            ]
        })
        this.commands = new Map();
        this.slash = [];
        this.login(token);
        this.on(Events.ClientReady, () => this.init());     
    }
    private async init(): Promise<void>{
        
        if (!this.user) return console.error(`Error when starting.`);
        console.log(`Ready! Logged in as ${this.user.tag}`)
        await this.ResetSlashCommands();
        await this.LoadCommands(path.join(dirname, '../../modules'));
        await this.LoadEvents(path.join(dirname, '../../modules'));
        await this.DeployCommands(token, clientId);
        await this.ready();

    }
    private async ready(): Promise<void>{
       
        this.user?.setActivity("Greg", { type: ActivityType.Listening });

        const ChannelStart = this.channels?.cache.get("1327337445246636053") as GuildTextBasedChannel
        ChannelStart?.send({content:":white_check_mark: Time for botting !"})
    }
    private async ResetSlashCommands(): Promise<void> {
        const guilds = this.guilds.cache;
        for (const guild of guilds.values()) {
            await guild.commands.set([]);
        }
        console.log(`[RESET]: Commands has been deleted in ${guilds.size} guilds.`)
    }

    private async LoadCommands(dir: string): Promise<void> {
        const modules = readdirSync(dir); // Lire tous les modules
        for (const module of modules) {
            const modulePath = path.join(dir, module);
            const commandsPath = path.join(modulePath, "commands");
    
            if (!readdirSync(modulePath).includes("commands")) continue; // Sauter si le dossier 'commands' n'existe pas
    
            const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const fileURL = pathToFileURL(filePath).href;
                try {
                    const command = await import(fileURL);
                    if ('data' in command.default && 'execute' in command.default && 'help' in command.default) {
                        this.commands.set(command.default.data.name, command.default);
                        this.slash.push(command.default.data.toJSON());
                        console.log(`[COMMAND LOADED]: ${command.default.data.name} from module "${module}".`);
                    } else {
                        console.log(`[WARNING] The command: ${filePath} is missing a property "data", "execute", or "help".`);
                    }
                } catch (error) {
                    console.error(`Failed to load command at ${filePath}:`, error);
                }
            }
        }
    }
    

    private async LoadEvents(dir: string): Promise<void> {
        const modules = readdirSync(dir); // Lire tous les modules
        for (const module of modules) {
            const modulePath = path.join(dir, module);
            const eventsPath = path.join(modulePath, "events");
    
            if (!readdirSync(modulePath).includes("events")) continue; // Sauter si le dossier 'events' n'existe pas
    
            const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                const fileURL = pathToFileURL(filePath).href;
                try {
                    const event = await import(fileURL);
                    if (event.once) {
                        this.once(event.default.name, (...args: any) => event.default.execute(...args));
                        console.log(`[EVENT LOADED]: ${event.default.name} (once) from module "${module}".`);
                    } else {
                        this.on(event.default.name, (...args: any) => event.default.execute(...args));
                        console.log(`[EVENT LOADED]: ${event.default.name} (on) from module "${module}".`);
                    }
                } catch (error) {
                    console.error(`Failed to load event at ${filePath}:`, error);
                }
            }
        }
    }
    

    private async DeployCommands(token: any, clientId: any): Promise<void> {
        const rest = new REST().setToken(token);
        (async () => {
            try {
                console.log(`[REFRESH]: ${this.slash.length}  (/) commands have been refresh.`);
                const data = await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: this.slash },
                );
                console.log(`[SUCESS]: ${this.slash.length}  (/) commands have been loaded.`);
            } catch (error) {
                console.error(error);
            }
        })();
    }
}