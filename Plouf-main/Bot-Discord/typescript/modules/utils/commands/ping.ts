import {SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js"
import { MiscCommand } from "../../../base/structure/commandType.js";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";
    
const Command = {
	help: {
        Name: "Ping",
		Emoji :"👍",
        DescriptionShort: "Description courte Ping",
        DescriptionLong: "Description longue Ping"
    },
	data: new MiscCommand()
		.setName('ping')
		.setDescription('Replies with Pong!'),
        
	async execute(interaction: ChatInputCommandInteraction){
		await executeRoleBasedCommand(interaction, 1, false, async (interaction: ChatInputCommandInteraction) => {
		await interaction.reply('Pong!');
	});
	},
};


export default Command;