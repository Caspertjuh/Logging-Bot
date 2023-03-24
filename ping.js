const Discord = require('discord.js');
const path = require('path');

module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(message, args) {
    const timestamp = new Date().getTime();
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Pinging...')
      .setTimestamp();
    message.channel.send({ embeds: [embed] }).then(sentMessage => {
      const timestamp2 = new Date().getTime();
      const botLatency = timestamp2 - timestamp;
      const apiLatency = message.client.ws.ping;
      const requesterName = message.author.username;
      const requesterAvatar = message.author.displayAvatarURL({ format: 'png', size: 128 });
      const embed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Pong!')
        .addFields(
          { name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
          { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
        )
        .setTimestamp()
        .setFooter(`Requested by ${requesterName}`, requesterAvatar);
      sentMessage.edit({ embeds: [embed] });
    });
  },
};
