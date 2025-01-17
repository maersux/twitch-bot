import * as fs from 'fs';
import { Api } from './utils/Api.js';
import { ConduitClient } from './utils/ConduitClient.js';
import { Cooldown } from './utils/cooldown.js';
import { Database } from './utils/Database.js';
import { Logger } from './utils/Logger.js';
import { Permissions } from './utils/permissions.js';
import { Utils } from './utils/utils.js';
import { Stats } from './utils/Stats.js';

export class Bot {
  constructor() {
    this.log = new Logger();

    this.api = new Api();
    this.db = new Database();

    this.utils = new Utils();
    this.stats = new Stats();

    this.conduitClient = new ConduitClient();
    this.permissions = new Permissions();
    this.cooldown = new Cooldown();

    this.commands = new Map();
    this.channels = new Set();
  }

  async initialize() {
    const [channels] = await Promise.all([
      bot.db.query(`SELECT userId FROM channels`),
      this.loadCommands()
    ]);

    this.channels = new Set(channels.map((channel) => channel.userId));

    await Promise.all([this.permissions.initialize(), this.conduitClient.initialize()]);
  }

  async loadCommands() {
    const commandFiles = fs.readdirSync(`./commands`).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = await import(`../commands/${file}?${Date.now()}`);

      if (!command?.default?.name) {
        this.log.error(`failed to load Command ${file}`);
        continue;
      }

      this.commands[command.default.name] = command.default;

      for (const alias of command.default.aliases || []) {
        this.commands[alias] = this.commands[command.default.name];
      }
    }
  }
}
