// scripts/generate-vapid-keys.mjs
// Run: node scripts/generate-vapid-keys.mjs
// This generates your free VAPID keys for Web Push notifications.

import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n🔑 VAPID Keys Generated Successfully!\n');
console.log('Add these to your .env.local:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n⚠️  IMPORTANT: Generate keys ONCE and keep them permanently.');
console.log('Regenerating keys will invalidate all existing browser subscriptions.\n');
