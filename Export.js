const { MessageAttachment } = require('discord.js');
const pdf = require('html-pdf');
const fs = require('fs');

module.exports = {
  name: 'export',
  description: 'Export the Inventory.csv document as a PDF',
  async execute(message) {
    try {
      // Check if the user is authorized to use the command
      if (message.author.id !== '410423891400589313') {
        throw new Error('You do not have permission to use this command.');
      }

      const messageContent = message.content.trim();
      if (messageContent) {
        message.channel.send(messageContent);
      } else {
        console.error('Message content is empty or undefined');
      }

      const inventory = fs.readFileSync('./Inventory2.csv', 'utf-8');

      const options = {
        format: 'Letter',
        orientation: 'landscape',
      };

      const html = `<html><body><pre>${inventory}</pre></body></html>`;

      const requesterName = message.author.username;
      const pdfName = `Inventory_${requesterName}.pdf`;

      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) throw new Error(err);

        const attachment = new MessageAttachment(buffer, pdfName);
        message.channel.send({ files: [attachment] })
          .catch(error => console.error('Failed to export the inventory document as a PDF', error));
      });
    } catch (err) {
      console.error(err);
      message.channel.send({
        content: `You do not have permission to use this command.`,
        embeds: [{ description: 'Failed to export the inventory document as a PDF.' }]
      });
    }
  },
};
