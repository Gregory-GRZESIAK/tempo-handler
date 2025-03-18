import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
interface CommandHelp {
    Name: string;
    Emoji: string;
    DescriptionShort: string;
    DescriptionLong?: string;
}
interface Command {
    help?: CommandHelp;
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
declare const command: Command;
export default command;
