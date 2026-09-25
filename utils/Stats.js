export class Stats {
  constructor() {
    this.commandsExecuted = 0;
    this.runningSince = Math.floor(Date.now() / 1000);
  }

  commandExecuted(command = '') {
    if (!command) return;

    this.commandsExecuted++;
    return bot.db.tryQuery(
      'INSERT INTO commandStats (command, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
      [command]
    );
  }
}
