import { ButtonInteraction } from "discord.js";
declare function handleButtonInteraction(interaction: ButtonInteraction): Promise<void>;
declare const event: {
    name: string;
    execute: typeof handleButtonInteraction;
};
export default event;
