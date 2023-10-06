const { InteractionType } = require("discord.js");
const fs = require('fs');
const { roles } = require('../config.json');

module.exports = (client, params) => {
    
    if(params[0].type === InteractionType.MessageComponent) {
        const embedId = fs.readFileSync(__dirname + '/../embed_id.txt', 'utf8');

        if(params[0].message.id == embedId) {
            let isRoleAllowed = false;
            Object.values(roles).forEach(roleData => {
                if(roleData.id == params[0].customId) {
                    isRoleAllowed = true;
                }
            });

            if(!isRoleAllowed) { 
                return params[0].reply({
                    content: `Invalid Role Selection`,
                    ephemeral: true,
                }); 
            }

            const role = params[0].guild.roles.cache.find(role => role.id === params[0].customId);

            if(!role) {
                return params[0].reply({
                    content: `Role couldn't be found`,
                    ephemeral: true,
                }); 
            }

            if(params[0].member.roles.cache.some(userRole => userRole.id === role.id)) {
                params[0].member.roles.remove(role);
                return params[0].reply({
                    content: `${role.name} has been removed from you.`,
                    ephemeral: true,
                });
            } else {
                params[0].member.roles.add(role);
                return params[0].reply({
                    content: `${role.name} has been assigned to you!`,
                    ephemeral: true,
                });
            }
        }
    }
}