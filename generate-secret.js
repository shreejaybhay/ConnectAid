#!/usr/bin/env node

/**
 * Generate a secure NEXTAUTH_SECRET for production
 * Run with: node generate-secret.js
 */

const crypto = require('crypto');

function generateSecret() {
  // Generate a 32-byte random string and encode it as base64
  const secret = crypto.randomBytes(32).toString('base64');
  return secret;
}

console.log('🔐 Generated NEXTAUTH_SECRET for production:');
console.log('');
console.log(generateSecret());
console.log('');
console.log('📋 Copy this value and set it as NEXTAUTH_SECRET in your Vercel environment variables');
console.log('');
console.log('🚀 Steps to update:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project: connectaid-shree');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add/Update NEXTAUTH_SECRET with the value above');
console.log('5. Redeploy your application');
