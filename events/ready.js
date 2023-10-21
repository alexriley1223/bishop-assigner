const { roleAssignChannelId, roles } = require('../config.json');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { name, color } = require('@config/bot.json');
const BishopModuleEvent = require('@classes/BishopModuleEvent');
const { getParentDirectoryString } = require('@helpers/utils');
const { events } = require('../config.json');

module.exports = new BishopModuleEvent({
	name: 'ready',
	enabled: events[getParentDirectoryString(__filename, __dirname, 'events')],
	init: async (client, ...opt) => {
		await client.guilds.fetch(client.guildId);

		let hasPreviousEmbed = true;

		/* Get previous embed message id? */
		if (!fs.existsSync(__dirname + '/../embed_id.txt')) {
			hasPreviousEmbed = false;
		}

		// Check ticket channel exists
		await client.channels.fetch(roleAssignChannelId)
			.catch(() => {
				throw Error('The channel to assign roles does not exist!');
			});

		const openTicketChannel = await client.channels.cache.get(
			roleAssignChannelId,
		);

		if (!openTicketChannel.isTextBased()) {
			throw Error('The channel to assign roles is not a text channel!');
		}

		if (openTicketChannel.messages && hasPreviousEmbed) {
			const oldEmbedId = fs.readFileSync(__dirname + '/../embed_id.txt', 'utf8');
			await openTicketChannel.messages
				.fetch(oldEmbedId)
				.then((msg) => {
					msg.delete();
				});
		}

		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle('Role Assigner')
			.setDescription(
				'Select a role that you would like to be assigned. \n\n Selecting a role you already have will unassign it from you.',
			)
			.setFooter({
				text: `${name} Bot`,
				iconURL: client.user.displayAvatarURL({ dynamic: true }),
			});

		const row = new ActionRowBuilder();
		let rowCount = 0;

		for (const [key, value] of Object.entries(roles)) {
			if (rowCount < 25) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(value.id)
						.setLabel(key)
						.setEmoji(value.emoji)
						.setStyle(value.style),
				);
			}
			rowCount++;
		}

		try {
			client.channels.cache
				.get(roleAssignChannelId)
				.send({
					embeds: [embed],
					components: [row],
				})
				.then((msg) => {
					fs.writeFileSync(__dirname + '/../embed_id.txt', `${msg.id}`);
				});
		}
		catch (e) {
			client.bishop.logger.error('Assigner', `${e}`);
		}
	},
});