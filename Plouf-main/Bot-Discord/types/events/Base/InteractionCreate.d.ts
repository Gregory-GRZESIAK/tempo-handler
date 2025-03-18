import { Events, ChatInputCommandInteraction } from "discord.js";
declare const event: {
    name: Events;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default event;
