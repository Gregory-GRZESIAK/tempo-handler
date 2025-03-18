import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
declare const command: {
    help: {
        Name: string;
        Emoji: string;
        DescriptionShort: string;
        DescriptionLong: string;
    };
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default command;
