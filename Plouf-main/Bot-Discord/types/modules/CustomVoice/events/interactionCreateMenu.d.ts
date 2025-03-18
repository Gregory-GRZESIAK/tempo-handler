import { StringSelectMenuInteraction } from 'discord.js';
declare function handleInteractionCreate(interaction: StringSelectMenuInteraction): Promise<void>;
declare const event: {
    name: string;
    execute: typeof handleInteractionCreate;
};
export default event;
