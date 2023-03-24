const fs = require('fs');
const Discord = require('discord.js');
const csv = require('csv-parser');
const path = require('path');
const config = require(path.join(__dirname, 'Json', 'config.json'));
const { MessageEmbed } = require('discord.js');

module.exports = (message, args) => {
  const requesterAvatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
  const requesterName = message.author.username;
  if (args.length < 1) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Invalid Usage of command')
      .setDescription('Usage: `+check <Location>`')
      .setFooter('Made by: Solvin#4165  ™')
      .setTimestamp()
      .setFooter(`Requested by ${requesterName}`, requesterAvatar)
    return message.channel.send({ embeds: [embed] });
  }

  const location = args[0];

  if (!config.locations.some(loc => loc.name === location)) {
    const locationsList = config.locations.map(loc => `- ${loc.name}`).join('\n');
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Invalid location')
      .setDescription(`Use one of the following locations:\n${locationsList}`)
      .setTimestamp()
      .setFooter(`Requested by ${requesterName}`, requesterAvatar)
    return message.channel.send({ embeds: [embed] });
  }

  const inventory = [];

  fs.createReadStream('./Inventory2.csv')
    .pipe(csv())
    .on('data', (row) => {
      const loc = row.Location;
      if (loc === location) {
        const keys = Object.keys(row);
        for (let i = 1; i < keys.length; i++) {
          const name = keys[i];
          const amount = parseInt(row[name]);
          inventory.push({ name, amount });
        }
      }
    })
    .on('end', () => {
      if (inventory.length === 0) {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Inventory Empty')
          .setDescription(`There are no vehicles in the inventory for ${location}.`)
          .setTimestamp()
          .setFooter(`Requested by ${requesterName}`, requesterAvatar)
        return message.channel.send({ embeds: [embed] });
      }

      const embed = new MessageEmbed()
        .setColor('#00FF00')
        .setTitle(`Inventory for ${location}`)
        .setDescription(inventory.filter(v => v.amount > 0).map(v => `${v.amount}x ${v.name}`).join('\n'))
        .setTimestamp()
        .setFooter(`Requested by ${requesterName}`, requesterAvatar)

      message.channel.send({ embeds: [embed] });
    });
};
