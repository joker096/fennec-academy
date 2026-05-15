import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './google-play/assets';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function createAppIcon() {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const bgColor = hexToRgb('#1a1a2e');
  const accentColor = hexToRgb('#e94560');
  const highlightColor = hexToRgb('#f39c12');

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#e94560');
  gradient.addColorStop(1, '#f39c12');
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 40, 40, size - 80, size - 80, 80);
  ctx.fill();

  ctx.fillStyle = '#1a1a2e';
  drawRoundedRect(ctx, 70, 70, size - 140, size - 140, 60);
  ctx.fill();

  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 280px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', size / 2, size / 2 + 20);

  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 12;
  drawRoundedRect(ctx, 40, 40, size - 80, size - 80, 80);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'app-icon.png'), buffer);
  console.log('✅ App Icon created (512x512)');
}

function createFeatureGraphic() {
  const width = 1024;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bgColor = hexToRgb('#0f0f1a');
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#e94560';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(width / 2, height / 2 - 30);
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', 0, 0);
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Fennec', width / 2, height / 2 + 80);

  ctx.fillStyle = '#f39c12';
  ctx.font = '32px Arial';
  ctx.fillText('Language Survival', width / 2, height / 2 + 140);

  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, height / 2 + 180);
  ctx.lineTo(width / 2 + 200, height / 2 + 180);
  ctx.stroke();

  ctx.fillStyle = '#888888';
  ctx.font = '24px Arial';
  ctx.fillText('AI Mentors • Gamified Learning • S.P.E.C.I.A.L. Stats', width / 2, height / 2 + 220);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'feature-graphic.png'), buffer);
  console.log('✅ Feature Graphic created (1024x500)');
}

createAppIcon();
createFeatureGraphic();
console.log('🎨 All assets created in google-play/assets/');