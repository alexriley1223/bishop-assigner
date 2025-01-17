const { InteractionType } = require('discord.js');
const fs = require('fs');
const { roles } = require('../config.json');
const { getParentDirectoryString } = require('@helpers/utils');
const { events } = require('../config.json');
const BishopModuleEvent = require('@classes/BishopModuleEvent');

module.exports = new BishopModuleEvent({
	name: 'interactionCreate',
	enabled: events[getParentDirectoryString(__filename, __dirname, 'events')],
	init: async (client, ...opt) => {

		const interaction = opt[0];
		if (interaction.type === InteractionType.MessageComponent) {
			const embedId = fs.readFileSync(__dirname + '/../embed_id.txt', 'utf8');

			if (interaction.message.id.trim() == embedId.trim()) {
				let isRoleAllowed = false;
				Object.values(roles).forEach(roleData => {
					if (roleData.id == interaction.customId) {
						isRoleAllowed = true;
					}
				});

				if (!isRoleAllowed) {
					return interaction.reply({
						content: 'Invalid Role Selection',
						ephemeral: true,
					});
				}

				const role = interaction.guild.roles.cache.find(assignedRole => assignedRole.id === interaction.customId);

				if (!role) {
					return interaction.reply({
						content: 'Role couldn\'t be found',
						ephemeral: true,
					});
				}

				if (interaction.member.roles.cache.some(userRole => userRole.id === role.id)) {
					interaction.member.roles.remove(role);
					return interaction.reply({
						content: `${role.name} has been removed from you.`,
						ephemeral: true,
					});
				}
				else {
					interaction.member.roles.add(role);
					return interaction.reply({
						content: `${role.name} has been assigned to you!`,
						ephemeral: true,
					});
				}
			}
		}
	},

});