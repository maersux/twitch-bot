import WebSocket from 'ws';

export class Shard {
  url = 'wss://eventsub.wss.twitch.tv/ws';
  socket = null;
  sessionId = null;

  #closed = false;
  #ready = null;
  #keepaliveTimer = null;
  #keepaliveTimeout = 30_000;
  #retryTimer = null;
  #retryDelay = 1_000;
  #maxRetryDelay = 60_000;

  constructor(conduit) {
    this.conduit = conduit;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.#ready = null;
        this.close();
        reject(new Error('websocket: no working session within 30s'));
      }, 30_000);

      this.#ready = {
        resolve: () => {
          clearTimeout(timeout);
          resolve();
        },
        reject: (error) => {
          clearTimeout(timeout);
          this.close();
          reject(error);
        }
      };

      this.#open(this.url);
    });
  }

  close() {
    this.#closed = true;
    clearTimeout(this.#keepaliveTimer);
    clearTimeout(this.#retryTimer);
    this.socket?.close();
  }

  #open(url, replace = true) {
    const socket = new WebSocket(url);
    if (replace) this.socket = socket;

    socket.on('message', (data) => {
      this.#onMessage(socket, data).catch((error) => {
        bot.log.error('websocket: failed to handle message:', error);
      });
    });

    socket.on('error', (error) => {
      bot.log.twitch(`websocket: error: ${error.message}`);
    });

    socket.on('close', (code, reason) => {
      if (socket !== this.socket || this.#closed) return;

      clearTimeout(this.#keepaliveTimer);
      bot.log.twitch(
        `websocket: closed (${code}${reason.length ? `: ${reason}` : ''}), reconnecting in ${this.#retryDelay / 1000}s`
      );
      this.#scheduleReconnect();
    });
  }

  #scheduleReconnect() {
    clearTimeout(this.#retryTimer);
    this.#retryTimer = setTimeout(() => this.#open(this.url), this.#retryDelay);
    this.#retryDelay = Math.min(this.#retryDelay * 2, this.#maxRetryDelay);
  }

  #resetKeepalive() {
    clearTimeout(this.#keepaliveTimer);
    this.#keepaliveTimer = setTimeout(() => {
      bot.log.twitch('websocket: keepalive timed out, reconnecting');
      this.socket?.terminate();
    }, this.#keepaliveTimeout);
  }

  async #onMessage(socket, data) {
    let message;

    try {
      message = JSON.parse(data);
    } catch (error) {
      bot.log.twitch(`websocket: unparsable message: ${error.message}`);
      return;
    }

    const { metadata, payload } = message;

    if (metadata?.message_type === 'session_welcome') {
      return this.#onWelcome(socket, payload.session);
    }

    if (socket !== this.socket) return;
    this.#resetKeepalive();

    switch (metadata?.message_type) {
      case 'session_reconnect': {
        bot.log.twitch('websocket: twitch requested a reconnect');
        this.#open(payload.session.reconnect_url, false);
        return;
      }

      case 'notification': {
        return this.conduit.handleNotification(metadata.subscription_type, payload.event);
      }

      case 'revocation': {
        return this.conduit.handleRevocation(payload.subscription);
      }
    }
  }

  async #onWelcome(socket, session) {
    if (this.#closed) {
      socket.close();
      return;
    }

    const previous = this.socket;
    this.socket = socket;

    if (previous && previous !== socket) {
      previous.close();
    }

    this.#keepaliveTimeout = ((session.keepalive_timeout_seconds ?? 10) + 10) * 1000;
    this.#resetKeepalive();

    if (session.id === this.sessionId) {
      bot.log.twitch('websocket: reconnected');
      return;
    }

    try {
      await this.conduit.assignShard(session.id);
    } catch (error) {
      bot.log.error('websocket: failed to attach session to conduit:', error);

      if (this.#ready) {
        this.#ready.reject(error);
        this.#ready = null;
      } else {
        socket.close();
      }

      return;
    }

    this.sessionId = session.id;
    this.#retryDelay = 1_000;
    bot.log.twitch(`websocket: session ${session.id} attached to conduit`);

    this.#ready?.resolve();
    this.#ready = null;
  }
}
