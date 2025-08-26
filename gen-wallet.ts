// scripts/gen-wallet.ts
import { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import fs from "fs";

async function main() {
  // 1) make a new keypair
  const kp = Keypair.generate();
  const secretArray = Array.from(kp.secretKey);
  const pubkey = kp.publicKey.toBase58();

  // 2) write keypair.json for backup
  fs.writeFileSync("keypair.json", JSON.stringify(secretArray));
  console.log("✅ Wrote keypair.json");
  console.log("🔑 Public Key:", pubkey);

  // 3) print .env line you can paste
  console.log("\nPaste this into your .env:");
  console.log(`WALLET_SECRET_KEY=${JSON.stringify(secretArray)}\n`);

  // 4) fund on devnet so you can mint
  const url = process.env.RPC_URL || clusterApiUrl("devnet");
  const conn = new Connection(url, "confirmed");
  console.log("💧 Requesting airdrop on devnet...");
  const sig = await conn.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig, "confirmed");
  const bal = await conn.getBalance(kp.publicKey);
  console.log("💰 Devnet balance:", bal / LAMPORTS_PER_SOL, "SOL");
  console.log("🔗 Explorer:", `https://explorer.solana.com/address/${pubkey}?cluster=devnet`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
