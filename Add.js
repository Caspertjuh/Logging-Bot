const Discord = require('discord.js');
const csv = require('csv-parser');
const fs = require('fs');
const config = require('./Json/config.json');
const { MessageEmbed } = require('discord.js');
const item = ",";

const inventory = [];

fs.createReadStream('./Inventory2.csv')
  .pipe(csv())
  .on('data', (data) => {
    inventory.push(data);
  })
  .on('end', () => {
    console.log('Inventory loaded successfully');
  });

module.exports = (message, args) => {
  const requesterAvatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
  const requesterName = message.author.username;
  // Check if user has the appropriate role
  const requiredRole = message.guild.roles.cache.find(role => role.name === "Bot-Person");
  if (!message.member.roles.cache.has(requiredRole.id)) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('You do not have permission to use this command')
      .setTimestamp()
      .setFooter(`Requested by ${requesterName}`, requesterAvatar)
    return message.channel.send({ embeds: [embed] });
  }

  if (args.length < 3) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Invalid usage of command')
      .setDescription('Usage: `+add <Vehicle> <Location> <Amount>`')
      .setTimestamp()
      .setFooter(`Requested by ${requesterName}`, requesterAvatar)
    return message.channel.send({ embeds: [embed] });
  }

  const vehicle = args[0];
  const location = args[1];
  const amount = parseInt(args[2]); // Parse the amount to an integer

  if (isNaN(amount) || amount < 1) {
    return message.channel.send('Amount must be a number greater than zero.');
  }

  // Read the inventory CSV file
  const inventoryData = [];
  fs.createReadStream('./Inventory2.csv')
    .pipe(csv())
    .on('data', row => {
      inventoryData.push(row);
    })
    .on('end', () => {
      // Check if the location exists in the inventory CSV file
      const locationIndex = inventoryData.findIndex(row => row.Location === location);
      if (locationIndex === -1) {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Invalid location')
          .setDescription(`Location "${location}" does not exist in the inventory.`)
          .setTimestamp()
          .setFooter(`Requested by ${requesterName}`, requesterAvatar)
        return message.channel.send({ embeds: [embed] });
      }

      // Check if the vehicle already exists at the location in the inventory CSV file
      const vehicleIndex = inventoryData[locationIndex][vehicle] ? parseInt(inventoryData[locationIndex][vehicle]) : -1;
      if (vehicleIndex === -1) {
        // Vehicle not found for the location, add a new vehicle entry
        inventoryData[locationIndex][vehicle] = amount;
      } else {
        // Vehicle found for the location, update the amount
        inventoryData[locationIndex][vehicle] = vehicleIndex + amount;
      }

      // Write the updated inventory back to the file
      const writeStream = fs.createWriteStream('./Inventory2.csv');
      writeStream.write('Location,');

      // Write the vehicle types as header row
      const vehicleTypes = Object.keys(inventoryData[locationIndex]).filter(key => key !== 'Location');
      for (const vehicleType of vehicleTypes) {
        writeStream.write(`${vehicleType},`);
      }
      writeStream.write('\n');

      // Write the updated data to the file
      for (const row of inventoryData) {
        writeStream.write(`${row.Location},`);
        for (const vehicleType of vehicleTypes) {
          writeStream.write(`${row[vehicleType] ? row[vehicleType] : 0},`);
        }
        writeStream.write('\n');
      }

      writeStream.end();

      const embed = new MessageEmbed()
        .setColor('#00FF00')
        .setTitle('Inventory Updated')
        .setDescription(`Added ${amount} ${vehicle}(s) to the inventory for ${location}.`)
        .setTimestamp()
        .setFooter(`Requested by ${requesterName}`, requesterAvatar)
      message.channel.send({ embeds: [embed] });
    });
};
