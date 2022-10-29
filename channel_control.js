const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ComponentType, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const ms = require("ms")
module.exports = {
    cooldown:5,
    data: new SlashCommandBuilder() 
        .setName("channel-status")
        .setDescription("🛠 Channel control options")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((option) => option .setName('optionchannel').setDescription('Choose what you want to do in the channel!').setRequired(true)
            .addChoices( 
                { name: 'slowmode',                     value: 'slowmode' },
                { name: 'Disallow Mention Everyone',    value: 'Disallow-Mention-Everyone,MentionEveryone,deny' },
                { name: 'Allow Mention Everyone',       value: 'Allow-Mention-Everyone,MentionEveryone,allow' },
                { name: 'hide',                         value: 'hide,ViewChannel,deny' },
                { name: 'show',                         value: 'show,ViewChannel,allow' },
                { name: 'lock',                         value: 'lock,SendMessages,deny' },
                { name: 'unlock',                       value: 'unlock,SendMessages,allow' },
                { name: 'remove Reactions',             value: 'remove-Reactions,AddReactions,deny' },
                { name: 'Add Reactions',                value: 'Add-Reactions,AddReactions,allow' },
                { name: 'remove AttachFiles',           value: 'remove-AttachFiles,AttachFiles,deny' },
                { name: 'Add AttachFiles',              value: 'Add-AttachFiles,AttachFiles,allow' },
                { name: 'Disallow Create Invite',       value: 'Disallow-Create-Invite,CreateInstantInvite,deny' },
                { name: 'Allow Create Invite',          value: 'Allow-Create-Invite,CreateInstantInvite,allow' },
            )
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })
        function embedMessageNow(n){ return new EmbedBuilder() .setDescription(n) .setColor(0x8302fa) };
        const values = interaction.options.getString("optionchannel");
        if(values != 'slowmode'){
            const optionChannel = values.trim().split(",");
            let name = optionChannel[0].split('-').join(' '), value = optionChannel[1], status = optionChannel[2];
            interaction.channel.permissionOverwrites.set([ { id: interaction.guild.roles.everyone.id,  [status]:[value] } ])
            return await interaction.editReply({embeds:[embedMessageNow( `✅ Channel \` ${name} \` <#${interaction.channel.id}>` )]});
        }
        
		const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Nothing selected')
                    .addOptions([
                        { "name": "OFF",        "time": 0 },
                        { "name": "1 Seconds",  "time": 1 },
                        { "name": "2 Seconds",  "time": 2 },
                        { "name": "5 Seconds",  "time": 5 },
                        { "name": "15 Seconds", "time": 15 },
                        { "name": "1 Minutes",  "time": 60 },
                        { "name": "3 Minutes",  "time": 180 },
                        { "name": "5 Minutes",  "time": 300 },
                        { "name": "10 Minutes", "time": 600 },
                        { "name": "15 Minutes", "time": 900 },
                        { "name": "30 Minutes", "time": 1800 },
                        { "name": "1 Hour",     "time": 3600 },
                        { "name": "2 Hour",     "time": 7200 }
                            ].map((i) => {
                                return({ "label" : i.name,"value" : i.time.toString(), "emoji" : "🐌"})
                            })
                    ),
            );

        const collector = await (await interaction.editReply({ embeds: [embedMessageNow('🐌 | Choose the right time for the slowmode')], components: [row]})).createMessageComponentCollector({
            ComponentType: ComponentType.SelectMenu, time: ms("10s")
        });

        row.components.forEach((x) => x.setDisabled(true))

        collector.on("collect", async i => {
            interaction.channel.setRateLimitPerUser(i.values.toString());
            await i.deferUpdate();
            await interaction.editReply({embeds:[embedMessageNow(`✅ Slowmod in Channel <#${interaction.channel.id}> `)], components:[ new ActionRowBuilder().addComponents(row.components) ]});
        }),

        collector.on('end',  async (collected) => {
            await interaction.editReply({components:[ new ActionRowBuilder().addComponents(row.components) ]})
        });
    },
};
