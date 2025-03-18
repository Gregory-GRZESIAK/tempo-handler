import { Events, ButtonInteraction } from "discord.js";
declare const event: {
    name: Events;
    execute(interaction: ButtonInteraction): Promise<void>;
};
export default event;
