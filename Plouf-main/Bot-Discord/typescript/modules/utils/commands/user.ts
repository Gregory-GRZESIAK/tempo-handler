import {SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js"
import { MiscCommand } from "../../../base/structure/commandType.js";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";

const Command = {
	help: {
        Name: "User",
		Emoji :"🟩",
        DescriptionShort: "Description courte User",
        DescriptionLong: "Description longue User"
    },
	data: new MiscCommand()
		.setName('user')
		.setDescription('Provides information about the user.'),

	async execute(interaction: ChatInputCommandInteraction){
		await executeRoleBasedCommand(interaction, 1, false, async (interaction: ChatInputCommandInteraction) => {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		console.log(interaction)
		const member = interaction.guild?.members.cache.get(interaction.user?.id);
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${member?.joinedAt}.`);
	});
	},
};

export default Command;