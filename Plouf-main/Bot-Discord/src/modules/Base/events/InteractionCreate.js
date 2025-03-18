var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Events } from "discord.js";
const map = new Map();
const event = {
    name: Events.InteractionCreate,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isChatInputCommand())
                return;
            const client = interaction.client;
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                if (!interaction.deferred && !interaction.replied) {
                    yield interaction.reply({
                        content: `No command found for: **${interaction.commandName}**.`,
                        ephemeral: true
                    });
                }
                return;
            }
            try {
                if (!map.has(`${interaction.user.id}_${interaction.commandId}`)) {
                    map.set(`${interaction.user.id}_${interaction.commandId}`, { endAt: Math.round(Date.now() / 1000) + 5 });
                    setTimeout(() => {
                        map.delete(`${interaction.user.id}_${interaction.commandId}`);
                    }, 5000);
                    yield command.execute(interaction);
                }
                else {
                    const user = map.get(`${interaction.user.id}_${interaction.commandId}`);
                    const duration = (user.endAt - Math.round(Date.now() / 1000));
                    if (!interaction.deferred && !interaction.replied) {
                        yield interaction.reply({
                            content: `Calm down buddy.. ok ? You can use this command in **${duration}**s.`,
                            ephemeral: true
                        });
                    }
                }
            }
            catch (error) {
                if (!interaction.deferred && !interaction.replied) {
                    yield interaction.reply({
                        content: `An error occurred while executing the command: **${interaction.commandName}**.`,
                        ephemeral: true
                    });
                }
                console.error(error);
            }
        });
    },
};
export default event;
