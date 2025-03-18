import { VoiceState } from 'discord.js';
declare function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void>;
declare const event: {
    name: string;
    execute: typeof handleVoiceStateUpdate;
};
export default event;
