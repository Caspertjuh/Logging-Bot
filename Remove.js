const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const csv = require('csv-parser');
const config = require('./Json/config.json');

module.exports = (message, args) => {
  if (args.length < 3) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Invalid usage of command')
      .setDescription('Usage: `+remove <Vehicle> <Location> <Amount>`');
    return message.channel.send({ embeds: [embed] });
  }

  const vehicle = args[0];
  const location = args[1];
  const amount = parseInt(args[2]); // Parse the amount to an integer

  if (isNaN(amount) || amount < 1) {
    return message.channel.send('Amount must be a number greater than zero.');
  }

  const validLocations = config.locations.map(l => l.name);
  if (!validLocations.includes(location)) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Invalid location')
      .setDescription(`Use one of the following locations: ${validLocations.join(', ')}`);
    return message.channel.send({ embeds: [embed] });
  }

  let inventory = [];

  fs.createReadStream('./CSV/Inventory2.csv')
    .pipe(csv())
    .on('data', (row) => {
      inventory.push(row);
    })
    .on('end', () => {
      const locationIndex = inventory.findIndex(item => item.Location === location && item.Vehicle === vehicle);
      if (locationIndex === -1) {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('No Vehicles Found')
          .setDescription(`No ${vehicle}(s) found in ${location}.`);
        return message.channel.send({ embeds: [embed] });
      }

      const currentAmount = parseInt(inventory[locationIndex].Amount);
      if (currentAmount < amount) {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Insufficient Inventory')
          .setDescription(`There are only ${currentAmount} ${vehicle}(s) in ${location}.`);
        return message.channel.send({ embeds: [embed] });
      }

      inventory[locationIndex].Amount = currentAmount - amount;

      const writeStream = fs.createWriteStream('./CSV/Inventory2.csv');
      writeStream.write('Location,Vehicle,Amount\n');
      inventory.forEach(item => {
        writeStream.write(`${item.Location},${item.Vehicle},${item.Amount}\n`);
      });
      writeStream.end();

      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Inventory Updated')
        .setDescription(`Removed ${amount} ${vehicle}(s) from the inventory for ${location}.`);
      message.channel.send({ embeds: [embed] });
    });
};
