const Discord = require('discord.js');
const inventory = require('../inventory.json');
const config = require('./Json/config.json');
const { MessageEmbed } = require('discord.js');

module.exports = message => {
    let inventory = {};

    fs.readFile('./inventory.json', (err, data) => {
        if (err) throw err;
        inventory = JSON.parse(data);
        let locations = '';
        for (const location in inventory) {
            locations += `${inventory[location].amount}-${inventory[location].vehicle} at ${location}\n`;
        }

        const locationsEmbed = new Discord.MessageEmbed()
            .setTitle(`Inventory Locations`)
            .setColor('#0099ff')
            .addField('Locations', locations)
            .setTimestamp()
            .setFooter('Locations Checked');

        message.channel.send(locationsEmbed);
    });
};