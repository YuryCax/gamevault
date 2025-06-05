const fs = require('fs');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const password = process.env.KEY_PASSWORD || 'securepassword';
const key = crypto.scryptSync(password, 'salt', 32);

const decrypt = (encryptedData, ivHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

try {
  const [ivHex, encryptedData] = fs.readFileSync('/mnt/usb/keys.enc', 'utf8').split('\n');
  const decrypted = decrypt(encryptedData, ivHex);
  decrypted.split('\n').forEach(line => {
    if (line) {
      const [key, value] = line.split('=');
      process.env[key] = value;
    }
  });
  console.log('Keys loaded from USB');
} catch (err) {
  console.error('Failed to load keys:', err.message);
  process.exit(1);
}