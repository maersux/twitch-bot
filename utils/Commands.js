import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export class Commands {
  directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../commands');

  #commands = new Map();

  async initialize() {
    const files = await readdir(this.directory, { recursive: true });

    for (const file of files.filter((file) => file.endsWith('.js'))) {
      try {
        const { default: command } = await import(pathToFileURL(path.join(this.directory, file)));
        command.name ??= path.basename(file, '.js');

        this.#add(command.name, command, file);
        for (const alias of command.aliases ?? []) {
          this.#add(alias, command, file);
        }
      } catch (error) {
        bot.log.error(`failed to load command ${file}:`, error);
      }
    }

    bot.log.info(`loaded ${this.count()} commands`);
  }

  get(trigger) {
    return this.#commands.get(trigger.toLowerCase()) ?? null;
  }

  all() {
    return [...new Set(this.#commands.values())];
  }

  count() {
    return this.all().length;
  }

  usage(msg, command) {
    return { error: `usage: ${msg.prefix}${msg.command.trigger} ${command.usage ?? ''}`.trim() };
  }

  #add(trigger, command, file) {
    trigger = trigger.toLowerCase();

    if (this.#commands.has(trigger)) {
      bot.log.warn(`${file}: "${trigger}" is already used by ${this.#commands.get(trigger).name}`);
      return;
    }

    this.#commands.set(trigger, command);
  }
}
