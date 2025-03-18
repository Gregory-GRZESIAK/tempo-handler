import { 
    BitFieldResolvable, 
    PermissionFlagsBits, 
    ChatInputCommandInteraction, 
    ClientEvents, 
    Message
 } from 'discord.js';
import { App } from '../structure/App.js';

import { Events } from '../structure/Events.js';
import { Args } from '../structure/Args.js';
type Permissions = BitFieldResolvable<keyof typeof PermissionFlagsBits, bigint>;
type ArgType = 'Attachment' | 'User' | 'Channel' | 'Role' | 'Mentionable' | 'String' | 'Integer' | 'Number' | 'Boolean' | 'Subcommand' | 'SubcommandGroup';
type Category = 'General' | 'Moderation' | 'Fun' | 'Utility' | 'Music' | 'Economy' | 'Configuration' | 'Developer' | 'Information' | 'Giveaway' | 'Voice' | 'Template'
interface Choice {
    name: string;
    value: string | number;
}

interface Arg {
    name: string;
    description: string;
    type: ArgType;
    choices?: Choice[];
    required?: boolean;
}



interface CommandBuilderOptionsBase {
    name: string;
    description: string;
    cooldown?: number;
    permissions?: Permissions[];
    args?: Arg[];
    permLevel: number;
    category: Category;
}

interface SlashCommandBuilderOptions extends CommandBuilderOptionsBase {
    slash: true;
}

interface MessageCommandBuilderOptions extends CommandBuilderOptionsBase {
    slash?: false;
}

type CommandBuilderOptions = SlashCommandBuilderOptions | MessageCommandBuilderOptions;

type ExecuteFunction<T extends CommandBuilderOptions> = T extends SlashCommandBuilderOptions
    ? (interaction: ChatInputCommandInteraction, app: App) => Promise<void>
    : (message: Message, app: App, args: Args) => Promise<void>;

interface Command<T extends CommandBuilderOptions> {
    options: T;
    execute: ExecuteFunction<T>;
}

type EventName = keyof ClientEvents;

interface EventBuilderOptions<T extends EventName> {
    name: T;
    description: string;
    category: Category;
}

interface Event<T extends EventName> {
    options: EventBuilderOptions<T>;
    execute: (...args: ClientEvents[T]) => Promise<void>;
}



export { ExecuteFunction, Command, MessageCommandBuilderOptions, SlashCommandBuilderOptions, CommandBuilderOptions, EventBuilderOptions, Event, EventName, ClientEvents, ArgType, Arg };
