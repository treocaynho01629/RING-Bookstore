/**
 * Monitor the reachability of the server
 * and notify the listeners when the status changes
 */
class ReachableMonitor {
  listeners = new Set();
  connected = true;
  retryDelay = 1000;

  async ping() {
    try {
      const res = await fetch("/api/v1/ping", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Server error");

      this.setConnected(true);
      this.retryDelay = 1000; // reset backoff
    } catch {
      this.setConnected(false);
      this.retry();
    }
  }

  retry() {
    setTimeout(() => this.ping(), this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, 30000); // exponential backoff max 30s
  }

  setConnected(status) {
    if (this.connected !== status) {
      this.connected = status;
      this.listeners.forEach((fn) => fn(status));
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const reachableMonitor = new ReachableMonitor();
