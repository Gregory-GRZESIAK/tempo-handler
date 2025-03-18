import {ChatInputCommandInteraction} from "discord.js"
import { MiscCommand } from "../../../base/structure/commandType.js";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";
const Command = {
	help: {
        Name: "Server",
		Emoji :"🟥",
        DescriptionShort: "Description courte Server",
        DescriptionLong: "Description longue Server"
    },
	data: new MiscCommand()
		.setName('server')
		.setDescription('Provides information about the server.'),

	async execute(interaction: ChatInputCommandInteraction) {
		await executeRoleBasedCommand(interaction, 1, false, async (interaction: ChatInputCommandInteraction) => {
			// interaction.guild is the object representing the Guild in which the command was run
			await interaction.reply(`This server is ${interaction.guild?.name} and has ${interaction.guild?.memberCount} members.`);
		});
	},
};

export default Command;
