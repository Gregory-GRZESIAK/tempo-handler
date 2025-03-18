import { ButtonInteraction } from 'discord.js';
declare function handleInteractionCreate(interaction: ButtonInteraction): Promise<void>;
declare const event: {
    name: string;
    execute: typeof handleInteractionCreate;
};
export default event;
