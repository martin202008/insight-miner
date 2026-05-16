/* WeChat Config Store - persist user credentials */
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

const DATA_DIR = join(process.cwd(), ".data");
const CONFIG_FILE = join(DATA_DIR, "wechat-config.json");

export interface WechatConfig {
  appId: string;
  appSecret: string;
  account: string;
  updatedAt: string;
}

function encrypt(text: string, key: string): string {
  const keyBuf = crypto.scryptSync(key, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuf, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string, key: string): string {
  try {
    const [ivHex, encrypted] = text.split(":");
    const keyBuf = crypto.scryptSync(key, "salt", 32);
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "";
  }
}

export async function saveWechatConfig(config: WechatConfig): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const secretKey = process.env.JWT_SECRET || "default-insight-miner-key";
  const encrypted = encrypt(JSON.stringify(config), secretKey);
  await writeFile(CONFIG_FILE, encrypted, "utf8");
}

export async function getWechatConfig(): Promise<WechatConfig | null> {
  try {
    const data = await readFile(CONFIG_FILE, "utf8");
    const secretKey = process.env.JWT_SECRET || "default-insight-miner-key";
    const decrypted = decrypt(data, secretKey);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as WechatConfig;
  } catch {
    return null;
  }
}