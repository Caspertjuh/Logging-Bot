const { MessageAttachment } = require('discord.js');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');

module.exports = {
  name: 'export',
  description: 'Export the Inventory.csv document as an Excel file',
  async execute(message) {
    try {
      // Check if the user has the 'Bot-Person' role
      if (!message.member.roles.cache.some(role => role.name === 'Bot-Person')) {
        throw new Error('You do not have permission to use this command.');
      }

      const inventoryData = [];
      const inventoryPath = './Inventory2.csv';

      // Read the CSV file and convert it to an array of objects
      fs.createReadStream(inventoryPath)
        .pipe(csv())
        .on('data', (row) => {
          inventoryData.push(row);
        })
        .on('end', () => {
          // Create a new workbook
          const workbook = xlsx.utils.book_new();

          // Convert the inventory data to a worksheet
          const inventorySheet = xlsx.utils.json_to_sheet(inventoryData);

          // Add the inventory worksheet to the workbook
          xlsx.utils.book_append_sheet(workbook, inventorySheet, 'Inventory');

          // Write the workbook to a buffer
          const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

          // Send the buffer as an Excel file
          const attachment = new MessageAttachment(buffer, 'Inventory.xlsx');
          message.channel.send({ files: [attachment] });
        });
    } catch (err) {
      console.error(err);
      message.channel.send({
        content: `You do not have permission to use this command.`,
        embeds: [{ description: 'Failed to export the inventory document as an Excel file.' }]
      });
    }
  },
};
