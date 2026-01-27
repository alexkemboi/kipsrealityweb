import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Recreate __dirname (It doesn't exist natively in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Define Paths (Go up one level from /scripts to root)
const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');

console.log('🏗️  Preparing Standalone Build for Production...');

// Check if standalone directory exists
if (!fs.existsSync(standaloneDir)) {
    console.error('❌ Error: .next/standalone directory not found. Did you run "next build"?');
    process.exit(1);
}

// Helper to copy directories safely
function copyDirectory(src, dest) {
    if (fs.existsSync(src)) {
        try {
            // fs.cpSync is available in Node 16.7+
            fs.cpSync(src, dest, { recursive: true, force: true });
            console.log(`✅ Copied: ${path.basename(src)} -> .next/standalone/${path.basename(src)}`);
        } catch (err) {
            console.error(`❌ Failed to copy ${src}:`, err);
            process.exit(1);
        }
    } else {
        console.warn(`⚠️  Source not found: ${src}`);
    }
}

// Execute Copies
copyDirectory(staticSrc, staticDest);
copyDirectory(publicSrc, publicDest);

console.log('🚀 Standalone build ready for deployment!');