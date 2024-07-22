import * as fs from 'fs';
import { logger } from './Logger.js';
import { db } from './Database.js';

export const bot = {
  ignoredUsers: new Set,
  runningSince: 0,
  commands: {},

  initialize: async function() {
    this.runningSince = new Date();

    const [ignoredUsers] = await Promise.all([
      db.query(`SELECT user_id FROM ignored_users`),
      this.loadCommands()
    ]);

    this.ignoredUsers = new Set(ignoredUsers.map(user => user.user_id));
  },

  loadCommands: async function() {
    const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = await import(`../commands/${file}?${Date.now()}`);

      if (!command?.default?.name) {
        logger.error(`Failed to load Command ${file}`);
        continue;
      }

      this.commands[command.default.name] = command.default;

      for (const alias of command.default.aliases || []) {
        this.commands[alias] = this.commands[command.default.name];
      }
    }
  }
};