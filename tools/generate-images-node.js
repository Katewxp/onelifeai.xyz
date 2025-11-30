// Node.js script to generate icons and images for OneLife
// Requires: npm install canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets');

// Ensure directories exist
const iconsDir = path.join(outputDir, 'icons');
const imagesDir = path.join(outputDir, 'images');

[iconsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function drawIcon(size, isLarge = false) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient (dark theme)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(0.5, '#1a1f3a');
    gradient.addColorStop(1, '#667eea');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const scale = size / 512;
    
    // Draw AI brain/circuit pattern
    ctx.strokeStyle = '#667eea';
    ctx.fillStyle = '#667eea';
    ctx.lineWidth = 3 * scale;
    
    // Main circle (AI core)
    const mainRadius = 120 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, mainRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Circuit nodes
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
        const angle = (Math.PI * 2 * i) / nodeCount;
        const nodeRadius = mainRadius * 0.8;
        const nodeX = centerX + Math.cos(angle) * nodeRadius;
        const nodeY = centerY + Math.sin(angle) * nodeRadius;
        
        // Draw node
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connection lines
        if (i < nodeCount / 2) {
            const nextAngle = (Math.PI * 2 * (i + 1)) / nodeCount;
            const nextX = centerX + Math.cos(nextAngle) * nodeRadius;
            const nextY = centerY + Math.sin(nextAngle) * nodeRadius;
            
            ctx.beginPath();
            ctx.moveTo(nodeX, nodeY);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();
        }
    }
    
    // Local/Privacy indicator (small lock in corner)
    if (isLarge && size >= 180) {
        const lockSize = 40 * scale;
        const lockX = size - lockSize - 15 * scale;
        const lockY = 15 * scale;
        
        // Lock body
        ctx.fillStyle = '#38ef7d';
        const lockBodyW = lockSize * 0.6;
        const lockBodyH = lockSize * 0.5;
        const lockBodyX = lockX;
        const lockBodyY = lockY + lockSize * 0.3;
        const lockRadius = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(lockBodyX + lockRadius, lockBodyY);
        ctx.lineTo(lockBodyX + lockBodyW - lockRadius, lockBodyY);
        ctx.quadraticCurveTo(lockBodyX + lockBodyW, lockBodyY, lockBodyX + lockBodyW, lockBodyY + lockRadius);
        ctx.lineTo(lockBodyX + lockBodyW, lockBodyY + lockBodyH - lockRadius);
        ctx.quadraticCurveTo(lockBodyX + lockBodyW, lockBodyY + lockBodyH, lockBodyX + lockBodyW - lockRadius, lockBodyY + lockBodyH);
        ctx.lineTo(lockBodyX + lockRadius, lockBodyY + lockBodyH);
        ctx.quadraticCurveTo(lockBodyX, lockBodyY + lockBodyH, lockBodyX, lockBodyY + lockBodyH - lockRadius);
        ctx.lineTo(lockBodyX, lockBodyY + lockRadius);
        ctx.quadraticCurveTo(lockBodyX, lockBodyY, lockBodyX + lockRadius, lockBodyY);
        ctx.closePath();
        ctx.fill();
        
        // Lock shackle
        ctx.strokeStyle = '#38ef7d';
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.arc(lockX + lockSize * 0.3, lockY + lockSize * 0.3, lockSize * 0.2, Math.PI, 0, false);
        ctx.stroke();
    }
    
    // Text for large icons
    if (isLarge && size >= 180) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(24, 50*scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OL', centerX, centerY + mainRadius + 30*scale);
    }
    
    return canvas;
}

function drawOGImage() {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background gradient (dark theme)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(0.5, '#1a1f3a');
    gradient.addColorStop(1, '#667eea');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Decorative circles
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.beginPath();
    ctx.arc(width - 100, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, height - 100, 200, 0, Math.PI * 2);
    ctx.fill();
    
    // AI icon (large)
    const iconSize = 200;
    const iconX = width / 2;
    const iconY = height / 2 - 80;
    const scale = iconSize / 512;
    
    // Main circle
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 6 * scale;
    const mainRadius = 120 * scale;
    ctx.beginPath();
    ctx.arc(iconX, iconY, mainRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(iconX, iconY, mainRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Circuit nodes
    const nodeCount = 8;
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < nodeCount; i++) {
        const angle = (Math.PI * 2 * i) / nodeCount;
        const nodeRadius = mainRadius * 0.8;
        const nodeX = iconX + Math.cos(angle) * nodeRadius;
        const nodeY = iconY + Math.sin(angle) * nodeRadius;
        
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Local indicator (lock)
    const lockSize = 60 * scale;
    const lockX = iconX + mainRadius + 30 * scale;
    const lockY = iconY - 30 * scale;
    
    ctx.fillStyle = '#38ef7d';
    const lockBodyW = lockSize * 0.6;
    const lockBodyH = lockSize * 0.5;
    const lockBodyX = lockX - lockSize * 0.3;
    const lockBodyY = lockY + lockSize * 0.3;
    const lockRadius = 5 * scale;
    ctx.beginPath();
    ctx.moveTo(lockBodyX + lockRadius, lockBodyY);
    ctx.lineTo(lockBodyX + lockBodyW - lockRadius, lockBodyY);
    ctx.quadraticCurveTo(lockBodyX + lockBodyW, lockBodyY, lockBodyX + lockBodyW, lockBodyY + lockRadius);
    ctx.lineTo(lockBodyX + lockBodyW, lockBodyY + lockBodyH - lockRadius);
    ctx.quadraticCurveTo(lockBodyX + lockBodyW, lockBodyY + lockBodyH, lockBodyX + lockBodyW - lockRadius, lockBodyY + lockBodyH);
    ctx.lineTo(lockBodyX + lockRadius, lockBodyY + lockBodyH);
    ctx.quadraticCurveTo(lockBodyX, lockBodyY + lockBodyH, lockBodyX, lockBodyY + lockBodyH - lockRadius);
    ctx.lineTo(lockBodyX, lockBodyY + lockRadius);
    ctx.quadraticCurveTo(lockBodyX, lockBodyY, lockBodyX + lockRadius, lockBodyY);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#38ef7d';
    ctx.lineWidth = 6 * scale;
    ctx.beginPath();
    ctx.arc(lockX, lockY + lockSize * 0.3, lockSize * 0.2, Math.PI, 0, false);
    ctx.stroke();
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.fillText('OneLife', width / 2, iconY + 200);
    
    // Subtitle
    ctx.font = '36px Arial';
    ctx.shadowBlur = 10;
    ctx.fillText('Your Life. One Local AI.', width / 2, iconY + 280);
    
    // Tagline
    ctx.font = '28px Arial';
    ctx.fillStyle = '#38ef7d';
    ctx.shadowBlur = 5;
    ctx.fillText('100% Local • No Cloud • Complete Privacy', width / 2, iconY + 330);
    
    // Domain
    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 3;
    ctx.fillText('onelifeai.xyz', width / 2, height - 40);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    return canvas;
}

// Generate icons
console.log('Generating icons for OneLife...\n');

try {
    // Generate favicon (64x64 for better quality)
    const favicon = drawIcon(64);
    fs.writeFileSync(path.join(iconsDir, 'favicon.png'), favicon.toBuffer('image/png'));
    console.log('✓ Generated: favicon.png (64x64)');
    
    // Copy to root as favicon.ico (temporary, should convert to ICO format)
    fs.writeFileSync(path.join(__dirname, '..', 'favicon.ico'), favicon.toBuffer('image/png'));
    console.log('✓ Generated: favicon.ico (root, PNG format)');

    const appleTouch = drawIcon(180, true);
    fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleTouch.toBuffer('image/png'));
    console.log('✓ Generated: apple-touch-icon.png (180x180)');

    const icon192 = drawIcon(192, true);
    fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192.toBuffer('image/png'));
    console.log('✓ Generated: icon-192x192.png (192x192)');

    const icon512 = drawIcon(512, true);
    fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512.toBuffer('image/png'));
    console.log('✓ Generated: icon-512x512.png (512x512)');

    // Generate OG image
    console.log('\nGenerating OG image...');
    const ogImage = drawOGImage();
    fs.writeFileSync(path.join(imagesDir, 'og-image.jpg'), ogImage.toBuffer('image/jpeg', { quality: 0.9 }));
    console.log('✓ Generated: og-image.jpg (1200x630)');

    console.log('\n✅ All images generated successfully!');
    console.log(`Icons saved to: ${iconsDir}`);
    console.log(`OG image saved to: ${imagesDir}`);
    console.log(`\nNote: favicon.ico is currently PNG format. For best compatibility, convert to ICO using:`);
    console.log(`   https://favicon.io/favicon-converter/`);
} catch (error) {
    console.error('Error generating images:', error);
    if (error.message.includes('canvas')) {
        console.error('\nNote: If you see "Cannot find module \'canvas\'", run: npm install canvas');
    }
    process.exit(1);
}

