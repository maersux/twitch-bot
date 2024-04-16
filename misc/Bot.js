import * as fs from 'fs';

export let runningSince = 0;
export let commands = {};

const loadCommands = async () => {
	const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = await import(`../commands/${file}?${Date.now()}`);

		if (!command?.default?.name) {
			console.error(`Failed to load Command ${file}`);
			continue;
		}

		commands[command.default.name] = command.default;

		for (const alias of command.default.aliases || []) {
			commands[alias] = commands[command.default.name];
		}
	}
}

export const setupBot = async () => {
	runningSince = Date.now();
	await loadCommands();
}