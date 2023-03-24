const Discord = require('discord.js');
const csv = require('csv-parser');
const fs = require('fs');
const config = require('./Json/config.json');
const { MessageEmbed } = require('discord.js');
const Locations = require('./Json/config.json');

const inventory = [];

fs.createReadStream('./Inventory2.csv')
  .pipe(csv())
  .on('data', (data) => {
    inventory.push(data);
  })
  .on('end', () => {
    console.log('Inventory loaded successfully');
  });

module.exports = async (message, args) => {
  if (args.length < 4) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Incorrect number of arguments')
      .setDescription('Usage: `+log <vehicle> <amount> <location-1> <location-2>`')
      .setFooter('Made by: Solvin#4165  ™');
    return message.channel.send({ embeds: [embed] });
  }

  const vehicle = args[0];
  const amount = parseInt(args[1]);
  const location = args[2];
  const newlocation = args[3];

  if (!vehicle || !amount || !location || !newlocation) {
    return message.channel.send('One or more of the arguments is empty or undefined.');
  }

  if (isNaN(amount) || amount < 1) {
    return message.channel.send('Amount must be a number greater than zero.');
  }

  // Check if the location exists in the inventory
  if (Array.isArray(Locations) && Locations.some(item => item.name === location)) {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Invalid location')
      .setDescription(`Location "${location}" does not exist in the inventory.`)
      .setFooter('Made by: Solvin#4165  ™');
    return message.channel.send({ embeds: [embed] });
  }

  // Check if the vehicle exists in the inventory and there is enough inventory for the requested amount
  const inventoryItem = inventory.find(item => item.Location === location && item.hasOwnProperty(vehicle) && parseInt(item[vehicle]) >= amount);
  if (!inventoryItem) {
    const embed = new Discord.MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Vehicle not found in inventory')
      .setDescription(`Vehicle ${vehicle} not found in inventory at location ${location}.`)
      .setFooter('Made by: Solvin#4165  ™');
    return message.channel.send({ embeds: [embed] });
  }

  // Update the inventory
  inventoryItem[vehicle] = parseInt(inventoryItem[vehicle]) - amount;
  if (inventoryItem[vehicle] < 0) {
    amount += inventoryItem[vehicle];
    inventoryItem[vehicle] = 0;
  }
  const arrivalItem = inventory.find(item => item.Location === newlocation);
  if (!arrivalItem) {
    const newItem = { Location: newlocation };
    newItem[vehicle] = amount;
    inventory.push(newItem);
  } else {
    arrivalItem[vehicle] = parseInt(arrivalItem[vehicle]) + amount;
  }

  // Save the updated inventory to file
  const csvWriter = require('csv-writer').createObjectCsvWriter({
    path: './CSV/Inventory2.csv',
    header: [
      { id: 'Location', title: 'Location' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' }
    ]
  });
  csvWriter.writeRecords(inventory)
    .then(() => {
      // Send confirmation message
      const embed = new Discord.MessageEmbed()
        .setTitle('Inventory Update')
        .setColor(0x00FF00)
        .setDescription(`Updated inventory as of now.`)
        .addField('Vehicle', vehicle.toString(), true)
        .addField('Amount', amount.toString(), true)
        .addField('Departure', location.toString(), true)
        .addField('Arrival', newlocation.toString(), true)
        .setFooter('Made by: Solvin#4165  ™');
      return message.channel.send({ embeds: [embed] });
    });
};
