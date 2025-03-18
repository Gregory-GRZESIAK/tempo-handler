import { Client as BaseClient } from 'discord.js';
export declare class Client extends BaseClient {
    commands: Map<string, any>;
    slash: string[];
    constructor();
    private init;
    private ready;
    private ResetSlashCommands;
    private LoadCommands;
    private LoadEvents;
    private DeployCommands;
}
