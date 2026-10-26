// ---------------------------------------------------------------------------
// The kill-before-boot guard: frees the e2e port before the standalone
// server binds it. A bun child that survived a prior run's cleanup keeps
// SERVING with open handles to a DELETED scratch db — reuseExistingServer
// then reuses it and every session bounces (the login mints tokens for
// users of the old inode; field-tested failure mode).
//
// Process-name matching (pkill -f) can't be used here: the launcher's own
// command line would contain the target string. Kill by PORT instead.
// ---------------------------------------------------------------------------

import { execSync } from "node:child_process";

const port = process.env.E2E_PORT ?? "3100";
try {
  const out = execSync(`lsof -t -i tcp:${port} -s tcp:listen 2>/dev/null`, {
    encoding: "utf-8",
  });
  const pids = out.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGKILL");
      console.log(`[kill-port] killed stale listener ${pid} on :${port}`);
    } catch {
      // already gone
    }
  }
  if (pids.length > 0) {
    // Give the kernel a moment to release the socket.
    execSync("sleep 1");
  }
} catch {
  // lsof found nothing — the port is free
}
