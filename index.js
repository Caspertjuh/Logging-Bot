// Index.js
const Discord = require('discord.js');
const config = require('./Json/config.json');

// const intents = 3276799; // Use this if you have enabled the intents in your developer portal
const intents = [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES
];

const client = new Discord.Client({ intents });

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'log':
      require('./log.js')(message, args);
      break;
    case 'move':
      require('./move.js').execute(message, args);
      break;
    case 'check':
      require('./Check.js')(message, args);
      break;
    case 'add':
      require('./Add.js')(message, args);
      break;
    case 'remove':
      require('./Remove.js')(message, args);
      break;
    case "ping":
      require('./ping.js').execute(message, args);
      break;
    case 'locations':
      require('./Locations.js')(message, args);
      break;
    case 'help':
      require('./help.js')(message, args);
      break;
    case 'stop':
    if (!message.member.roles.cache.some(role => role.name === 'Bot-Person')) {
    // create a new embed
    const embed = new Discord.MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Error')
      .setDescription('You do not have the required role to stop the bot.')
      .setFooter('Made by: Solvin#4165  ™'); 

    // send the embed to the message author
    return message.channel.send({ embeds: [embed] });
  }

  console.log('Stopping Bot');
  message.channel.send('Stopping Bot');
  client.destroy();
  break;
    case 'test':
      console.log('Testing Bot'); // add console log message
      message.channel.send('Testing Bot');
      break;
    case 'export':
        require('./export.js').execute(message, args);
        break;
    default:
      message.channel.send(`STUPID: ${command}`);
  }
  
});

client.login(config.token);