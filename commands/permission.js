export default {
  name: 'permission',
  description: 'get/update a users permission',
  cooldown: bot.cooldown.short,
  usage: '<status | permission> <user>',
  async execute(msg) {
    if (!msg.args.length) {
      return bot.commands.usage(msg, this);
    }

    const permission = msg.args[0].toLowerCase();
    const user = bot.utils.sanitizeUser(msg.args[1], msg.user.login);

    const userId = await bot.api.getUserId(user);
    if (!userId) {
      return { error: `FeelsDankMan user ${user} not found` };
    }

    const isCurrentUser = userId === msg.user.id;
    const currentPermission = bot.permissions.get(userId);

    if (permission === 'status') {
      const userText = isCurrentUser ? 'your' : `${bot.utils.antiPing(user)}'s`;
      return `${userText} current permission is ${bot.permissions.name(currentPermission)}`;
    }

    if (msg.user.perms < bot.permissions.admin) {
      return { error: 'NOIDONTTHINKSO you have to be an admin to update permissions' };
    }

    const permissionId = bot.permissions.level(permission);
    if (permissionId === undefined) {
      return {
        error: `FeelsDankMan permission ${permission} doesn't exist. ${bot.utils.joinMessage(Object.keys(bot.permissions.list), ', ')}`
      };
    }

    if (currentPermission >= msg.user.perms) {
      return {
        error: `NOIDONTTHINKSO you can't update the permission of ${bot.utils.antiPing(user)}`
      };
    }

    if (permissionId >= msg.user.perms) {
      return { error: `NOIDONTTHINKSO you can only give out permissions below your own` };
    }

    if (currentPermission === permissionId) {
      return {
        error: `FeelsDankMan user ${bot.utils.antiPing(user)} already has the permission ${permission}`
      };
    }

    await bot.permissions.set(userId, permissionId);
    return `user ${bot.utils.antiPing(user)} now has the permission ${permission}`;
  }
};
