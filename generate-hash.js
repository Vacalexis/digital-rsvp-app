// Script to generate SHA-256 hash for credentials
// Run with: node generate-hash.js

function hashCredentials(input) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Change these to your desired credentials
const username = 'admin';
const password = 'rsvp2024';

const credentials = `${username}:${password}`;
const hash = hashCredentials(credentials);

console.log(`\nCredentials: ${username}:${password}`);
console.log(`Hash: ${hash}`);
console.log(`\nPaste this hash into auth.service.ts VALID_HASH constant.`);
