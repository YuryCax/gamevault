const fs = require('fs');
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const password = process.env.KEY_PASSWORD || 'securepassword';
const key = crypto.scryptSync(password, 'salt', 32);
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

const envContent = `
MONGODB_URI=mongodb://admin:password@localhost:27017/gamevault?replicaSet=rs0
REDIS_SENTINEL_HOST_1=localhost
REDIS_SENTINEL_PORT_1=26379
REDIS_SENTINEL_HOST_2=localhost
REDIS_SENTINEL_PORT_2=26380
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
SNS_TOPIC_ARN=your_sns_arn
ADMIN_WHITELIST_IPS=127.0.0.1
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
`;

const { iv: ivHex, encryptedData } = encrypt(envContent);
fs.writeFileSync('/mnt/usb/keys.enc', `${ivHex}\n${encryptedData}`);
console.log('Keys encrypted and saved to /mnt/usb/keys.enc');