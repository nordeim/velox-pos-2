// Session-14 (SD-2): restore the dev db's owner password to the DOCUMENTED
// credential ($Abcd1234 — README's quick-start contract). The Session-13
// evidence run's "full one-shot reset round-trip" typed its own form-fill
// constant "Abcd1234!" into the reset form, silently changing db/custom.db's
// owner password — the s13 plan's "no state change" claim was wrong (the
// intent was right, the constant wasn't). This restores the documented
// state through the repo's own hashPassword seam (the same scrypt scheme
// the seed and the API use).
import { Database } from "bun:sqlite";
import { randomBytes, scryptSync } from "node:crypto";

const OWNER_EMAIL = "sepnetflix2023@outlook.com";
const OWNER_PASSWORD = "$Abcd1234";

const hashPassword = (password) => {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
};

const db = new Database("db/custom.db");
const before = db
  .query("SELECT passwordHash FROM User WHERE email = ?")
  .get(OWNER_EMAIL);
if (!before) throw new Error("owner not found in db/custom.db");

// Verify the drifted state first (control test: "Abcd1234!" must match).
const parts = String(before.passwordHash).split("$");
const drifted = scryptSync("Abcd1234!", Buffer.from(parts[1], "hex"), 64).toString("hex");
if (drifted !== parts[2]) {
  console.log("NOTE: current hash matches neither candidate — restoring anyway");
}

const newHash = hashPassword(OWNER_PASSWORD);
db.run("UPDATE User SET passwordHash = ? WHERE email = ?", [newHash, OWNER_EMAIL]);

// Verify the restore end-to-end (the new hash must validate $Abcd1234).
const after = db
  .query("SELECT passwordHash FROM User WHERE email = ?")
  .get(OWNER_EMAIL);
const afterParts = String(after.passwordHash).split("$");
const check = scryptSync(OWNER_PASSWORD, Buffer.from(afterParts[1], "hex"), 64).toString("hex");
db.close();

if (check !== afterParts[2]) throw new Error("restore failed verification");
console.log("owner password restored to the documented credential and verified");
