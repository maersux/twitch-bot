import { Api } from './utils/Api.js';
import { Channels } from './utils/Channels.js';
import { Commands } from './utils/Commands.js';
import { Cooldown } from './utils/Cooldown.js';
import { Database } from './utils/Database.js';
import { Logger } from './utils/Logger.js';
import { Permissions } from './utils/Permissions.js';
import { Stats } from './utils/Stats.js';
import { Utils } from './utils/Utils.js';
import { Conduit } from './utils/eventsub/Conduit.js';

export class Bot {
  constructor() {
    this.log = new Logger();

    this.api = new Api();
    this.db = new Database();

    this.utils = new Utils();
    this.stats = new Stats();

    this.eventsub = new Conduit();
    this.permissions = new Permissions();
    this.cooldown = new Cooldown();

    this.commands = new Commands();
    this.channels = new Channels();
  }

  async initialize() {
    await Promise.all([
      this.commands.initialize(),
      this.channels.initialize(),
      this.permissions.initialize()
    ]);

    await this.eventsub.initialize();
  }

  async teardown() {
    this.eventsub.teardown();
    await this.db.teardown();
  }
}
