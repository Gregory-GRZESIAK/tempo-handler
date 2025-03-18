import { ChatInputCommandInteraction } from "discord.js";
declare const Command: {
    help: {
        Name: string;
        Emoji: string;
        DescriptionShort: string;
        DescriptionLong: string;
    };
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default Command;
