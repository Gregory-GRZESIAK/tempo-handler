var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MiscCommand } from "../../../base/structure/commandType.js";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";
const Command = {
    help: {
        Name: "Ping",
        Emoji: "👍",
        DescriptionShort: "Description courte Ping",
        DescriptionLong: "Description longue Ping"
    },
    data: new MiscCommand()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeRoleBasedCommand(interaction, 1, false, (interaction) => __awaiter(this, void 0, void 0, function* () {
                yield interaction.reply('Pong!');
            }));
        });
    },
};
export default Command;
