const Discord = require('discord.js');
const path = require('path');
const { MessageEmbed } = require('discord.js');

module.exports = (message, args) => {
  try {
    const requesterAvatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
    const requesterName = message.author.username;
    
    const embed = new MessageEmbed()
        .setColor('#008080')
        .setTitle('Bot Commands')
        .addField('Move Command', '+move  <Amount> <Vehicle> <Location> <New Location>')
        .addField('Add Command', '+Add <Vehicle> <Location> <Amount>')
        .addField('Check Command', '+Check <Location>')
        .addField('Vehicles Input', 'Make sure to undersquare the spaces in any name. For example: Panzer IV F1 should be entered as Panzer_IV_F1')
        .addField('Honorable Mentions', 'Move a vehicle to Death with +Move if you died with it')
        .setTimestamp()
        .setFooter(`Requested by ${requesterName}`, requesterAvatar)

  message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
