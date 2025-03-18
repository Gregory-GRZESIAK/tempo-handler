var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GatewayIntentBits, Client as BaseClient, REST, Routes, Events, ActivityType } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env/" });
const token = process.env.TOKEN;
const clientId = process.env.CLIENTID;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
export class Client extends BaseClient {
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
        });
        this.commands = new Map();
        this.slash = [];
        this.login(token);
        this.on(Events.ClientReady, () => this.init());
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.user)
                return console.error(`Error when starting.`);
            console.log(`Ready! Logged in as ${this.user.tag}`);
            yield this.ResetSlashCommands();
            yield this.LoadCommands(path.join(dirname, '../../modules'));
            yield this.LoadEvents(path.join(dirname, '../../modules'));
            yield this.DeployCommands(token, clientId);
            yield this.ready();
        });
    }
    ready() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            (_a = this.user) === null || _a === void 0 ? void 0 : _a.setActivity("Greg", { type: ActivityType.Listening });
            const ChannelStart = (_b = this.channels) === null || _b === void 0 ? void 0 : _b.cache.get("1327337445246636053");
            ChannelStart === null || ChannelStart === void 0 ? void 0 : ChannelStart.send({ content: ":white_check_mark: Time for botting !" });
        });
    }
    ResetSlashCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            const guilds = this.guilds.cache;
            for (const guild of guilds.values()) {
                yield guild.commands.set([]);
            }
            console.log(`[RESET]: Commands has been deleted in ${guilds.size} guilds.`);
        });
    }
    LoadCommands(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = readdirSync(dir); // Lire tous les modules
            for (const module of modules) {
                const modulePath = path.join(dir, module);
                const commandsPath = path.join(modulePath, "commands");
                if (!readdirSync(modulePath).includes("commands"))
                    continue; // Sauter si le dossier 'commands' n'existe pas
                const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
                for (const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const fileURL = pathToFileURL(filePath).href;
                    try {
                        const command = yield import(fileURL);
                        if ('data' in command.default && 'execute' in command.default && 'help' in command.default) {
                            this.commands.set(command.default.data.name, command.default);
                            this.slash.push(command.default.data.toJSON());
                            console.log(`[COMMAND LOADED]: ${command.default.data.name} from module "${module}".`);
                        }
                        else {
                            console.log(`[WARNING] The command: ${filePath} is missing a property "data", "execute", or "help".`);
                        }
                    }
                    catch (error) {
                        console.error(`Failed to load command at ${filePath}:`, error);
                    }
                }
            }
        });
    }
    LoadEvents(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = readdirSync(dir); // Lire tous les modules
            for (const module of modules) {
                const modulePath = path.join(dir, module);
                const eventsPath = path.join(modulePath, "events");
                if (!readdirSync(modulePath).includes("events"))
                    continue; // Sauter si le dossier 'events' n'existe pas
                const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
                for (const file of eventFiles) {
                    const filePath = path.join(eventsPath, file);
                    const fileURL = pathToFileURL(filePath).href;
                    try {
                        const event = yield import(fileURL);
                        if (event.once) {
                            this.once(event.default.name, (...args) => event.default.execute(...args));
                            console.log(`[EVENT LOADED]: ${event.default.name} (once) from module "${module}".`);
                        }
                        else {
                            this.on(event.default.name, (...args) => event.default.execute(...args));
                            console.log(`[EVENT LOADED]: ${event.default.name} (on) from module "${module}".`);
                        }
                    }
                    catch (error) {
                        console.error(`Failed to load event at ${filePath}:`, error);
                    }
                }
            }
        });
    }
    DeployCommands(token, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rest = new REST().setToken(token);
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log(`[REFRESH]: ${this.slash.length}  (/) commands have been refresh.`);
                    const data = yield rest.put(Routes.applicationCommands(clientId), { body: this.slash });
                    console.log(`[SUCESS]: ${this.slash.length}  (/) commands have been loaded.`);
                }
                catch (error) {
                    console.error(error);
                }
            }))();
        });
    }
}
