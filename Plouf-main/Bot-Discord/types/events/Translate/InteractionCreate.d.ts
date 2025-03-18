import { MessageReaction, User } from "discord.js";
declare const event: {
    name: string;
    execute(reaction: MessageReaction, user: User): Promise<void>;
};
export default event;
