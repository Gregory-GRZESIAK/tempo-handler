import { ChatInputCommandInteraction } from "discord.js";
import { MiscCommand } from "../../../base/structure/commandType.js";
declare const Command: {
    help: {
        Name: string;
        Emoji: string;
        DescriptionShort: string;
        DescriptionLong: string;
    };
    data: MiscCommand;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default Command;
