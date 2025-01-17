export class Utils {
  now() {
    return Math.floor(Date.now() / 1000);
  }

  timeSince(timestamp) {
    const duration = Date.now() - timestamp;

    let seconds = Math.floor(duration / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    const formattedDays = days > 0 ? this.pluralize(days, 'day') + ', ' : '';
    const formattedHours = hours > 0 ? this.pluralize(hours, 'hour') + ', ' : '';
    const formattedMinutes = minutes > 0 ? this.pluralize(minutes, 'minute') + ', ' : '';
    const formattedSeconds = seconds > 0 ? this.pluralize(seconds, 'second') : '';

    return formattedDays + formattedHours + formattedMinutes + formattedSeconds;
  }

  antiPing(text = ``) {
    const [start = '', ...rest] = text;
    const end = rest.pop() || '';

    return `${start}\u{E0000}${rest.join('')}${rest.length ? '\u{E0000}' : ''}${end}`;
  }

  formatNumber(number = 0) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  pluralize(word, length, appendix = 's') {
    return length === 1 ? word : word + appendix;
  }

  joinMessage(messages, separator = ` | `) {
    return messages.filter(Boolean).join(separator);
  }

  async sleep(ms = 200) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
