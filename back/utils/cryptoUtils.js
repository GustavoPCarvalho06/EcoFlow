import crypto from "crypto";

const algorithm = "aes-256-gcm";
const secretKey = process.env.CRYPTO_SECRET;
const ivLength = 16;

if (!secretKey) {
  throw new Error("❌ CRYPTO_SECRET não definido. Configure no arquivo .env");
}

export function encrypt(text) {
  if (!text) return null;

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText) {
  if (!encryptedText) return null;

  const [ivHex, authTagHex, contentHex] = encryptedText.split(":");

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(contentHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
