import { AdminCommand } from '../../base/structure/commandType.js';
import { ChatInputCommandInteraction } from 'discord.js';
declare const command: {
    help: {
        Name: string;
        DescriptionShort: string;
        DescriptionLong: string;
    };
    data: AdminCommand;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default command;
