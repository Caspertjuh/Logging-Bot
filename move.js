const fs = require('fs');
const csv = require('csv-parser');
const { MessageEmbed } = require('discord.js');

exports.execute = async (message, args) => {
  const requesterAvatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
  const requesterName = message.author.username;

  if (args.length < 4) {
    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Error')
      .setDescription('Please provide the necessary arguments: +move [amount] [vehicle] [location1] [location2]')
      .setTimestamp()
      .setFooter(`Requested by ${requesterName}`, requesterAvatar);

    return message.channel.send({ embeds: [embed] });

  }

  const amount = parseInt(args[0]);
  const vehicle = args[1];
  const location1 = args[2];
  const location2 = args[3];

  const inventory = [];
  fs.createReadStream('Inventory2.csv')
    .pipe(csv())
    .on('data', (row) => inventory.push(row))
    .on('end', () => {
      const vehicleExists = inventory.some(row => row.hasOwnProperty(vehicle));
      const location1Exists = inventory.some(row => row.Location === location1);
      const location2Exists = inventory.some(row => row.Location === location2);

      if (!vehicleExists) {
        const embed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription(`${vehicle} does not exist in the inventory.`)
          .setTimestamp()
          .setFooter(`Requested by ${requesterName}`, requesterAvatar)

        return message.channel.send({ embeds: [embed] });
      }

      const vehicleAmount1 = inventory
        .filter(row => row.Location === location1)
        .reduce((total, row) => total + parseInt(row[vehicle]), 0);

      if (vehicleAmount1 < amount) {
        return message.channel.send({
          embeds: [new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription(`There are not enough ${vehicle}s in ${location1}.`)
            .setTimestamp()
            .setFooter(`Requested by ${requesterName}`, requesterAvatar)
          ]
        });
      }

      if (!location2Exists) {
        return message.channel.send({
          embeds: [new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription(`${location2} does not exist in the inventory.`)
            .setTimestamp()
            .setFooter(`Requested by ${requesterName}`, requesterAvatar)
          ]
        });
      }

      inventory.forEach(row => {
        if (row.Location === location1) {
          row[vehicle] = parseInt(row[vehicle]) - amount;
        } else if (row.Location === location2) {
          row[vehicle] = parseInt(row[vehicle]) + amount;
        }
      });

      const writer = fs.createWriteStream('Inventory2.csv');
      writer.write('Location,');
      const headerRow = inventory[0];
      for (const [key, value] of Object.entries(headerRow)) {
        if (key !== 'Location') {
          writer.write(`${key},`);
        }
      }
      writer.write('\n');
      inventory.forEach(row => {
        writer.write(`${row.Location},`);
        for (const [key, value] of Object.entries(row)) {
          if (key !== 'Location') {
            writer.write(`${value},`);
          }
        }
        writer.write('\n');
      });
      writer.end();

      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Success')
        .setDescription(`Successfully moved ${amount} ${vehicle}(s) from ${location1} to ${location2}.`)
        .setTimestamp()
        .setFooter(`Requested by ${requesterName}`, requesterAvatar)

      return message.channel.send({ embeds: [embed] });
    })
};
