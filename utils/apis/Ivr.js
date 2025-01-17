export class Ivr {
  async fetch(endpoint) {
    return await bot.api.fetch(`https://api.ivr.fi/v2/twitch/${endpoint}`);
  }

  async getUser(user) {
    const encodedUser = encodeURIComponent(user);

    const response =
      (await this.getUserById(encodedUser)) || (await this.getUserByLogin(encodedUser));
    if (response?.id) return response;

    return false;
  }

  async getUserById(userId) {
    if (isNaN(Number(userId))) return false;

    const data = await this.fetch(`user?id=${userId}`);
    if (!data?.[0]?.id) return false;

    return data[0];
  }

  async getUserByLogin(user) {
    const data = await this.fetch(`user?login=${user}`);
    if (!data?.[0]?.id) return false;

    return data[0];
  }

  async getUsername(userId) {
    const user = await this.getUser(userId);
    return user?.login || false;
  }

  async getUserId(username) {
    const user = await this.getUser(username);
    return user?.id || false;
  }
}
