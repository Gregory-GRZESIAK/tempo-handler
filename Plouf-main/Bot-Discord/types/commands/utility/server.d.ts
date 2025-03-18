import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
declare const Command: {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default Command;
