#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
  inputImage: 'assets/images/fractal_thought_engine_logo.png',
  outputDir: 'assets/images',
  rootDir: '.',
  // Set to true if you want to remove black backgrounds and make them transparent
  removeBlackBackground: true,
  sizes: {
    // Standard favicons
    'favicon-16x16.png': { width: 16, height: 16, location: 'assets/images' },
    'favicon-32x32.png': { width: 32, height: 32, location: 'assets/images' },
    
    // Apple touch icons
    'apple-touch-icon.png': { width: 180, height: 180, location: 'assets/images' },
    'apple-touch-icon-root.png': { width: 180, height: 180, location: '.', filename: 'apple-touch-icon.png' },
    
    // Android Chrome icons
    'android-chrome-192x192.png': { width: 192, height: 192, location: 'assets/images' },
    'android-chrome-512x512.png': { width: 512, height: 512, location: 'assets/images' },
    
    // ICO favicon (we'll create a 32x32 PNG first, then convert)
    'favicon-ico-source.png': { width: 32, height: 32, location: 'temp' }
  }
};

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}
async function analyzeInputImage() {
  try {
    const metadata = await sharp(config.inputImage).metadata();
    console.log('📊 Input image analysis:');
    console.log(`   • Format: ${metadata.format}`);
    console.log(`   • Size: ${metadata.width}x${metadata.height}`);
    console.log(`   • Channels: ${metadata.channels}`);
    console.log(`   • Has alpha: ${metadata.hasAlpha}`);
    console.log(`   • Background: ${metadata.background || 'none'}`);
    if (!metadata.hasAlpha) {
      console.log('⚠️  Warning: Input image has no alpha channel. Adding transparency...');
    }
    return metadata;
  } catch (error) {
    console.error('❌ Error analyzing input image:', error.message);
    throw error;
  }
}

async function generateFavicons() {
  try {
    console.log('🚀 Starting favicon generation...');
    
    // Check if input image exists
    try {
      await fs.access(config.inputImage);
      console.log(`✅ Found input image: ${config.inputImage}`);
    } catch (error) {
      throw new Error(`❌ Input image not found: ${config.inputImage}`);
    }
   // Analyze input image
   await analyzeInputImage();

    // Create temp directory for ICO processing
    await ensureDirectoryExists('temp');

    // Load the input image
   // Load and ensure the input image has proper transparency
   let inputProcessor = sharp(config.inputImage);
   
   // Remove black background if requested
   if (config.removeBlackBackground) {
     console.log('🎨 Removing black background...');
     inputProcessor = inputProcessor.removeAlpha().flatten({ background: { r: 0, g: 0, b: 0 } });
   }
   
   const inputBuffer = await inputProcessor
     .png({ quality: 100, compressionLevel: 9, force: true })
     .toBuffer();
    console.log('📖 Loaded input image');

    // Generate all PNG favicons
    for (const [name, options] of Object.entries(config.sizes)) {
      const outputPath = path.join(options.location, options.filename || name);
      
      // Ensure output directory exists
      await ensureDirectoryExists(options.location);
      
      console.log(`🔄 Generating ${name} (${options.width}x${options.height})...`);
      
      await sharp(inputBuffer)
        .resize(options.width, options.height, {
         fit: 'contain',
         background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
         withoutEnlargement: false
        })
       .ensureAlpha() // Ensure alpha channel exists
       .png({ 
         quality: 100, 
         compressionLevel: 9,
         adaptiveFiltering: false,
         force: true,
         palette: false // Prevent palette mode which can cause transparency issues
       })
        .toFile(outputPath);
      
      console.log(`✅ Created: ${outputPath}`);
    }

    // Generate ICO favicon using the 32x32 PNG
    console.log('🔄 Generating favicon.ico...');
    await generateIcoFavicon();

    // Generate web manifest
    console.log('🔄 Generating site.webmanifest...');
    await generateWebManifest();

    // Clean up temp directory
    await fs.rmdir('temp', { recursive: true });
    console.log('🧹 Cleaned up temporary files');

    console.log('🎉 All favicons generated successfully!');
    console.log('\n📋 Generated files:');
    console.log('   • favicon.ico (root)');
    console.log('   • apple-touch-icon.png (root)');
    console.log('   • site.webmanifest (root)');
    console.log('   • assets/images/favicon-16x16.png');
    console.log('   • assets/images/favicon-32x32.png');
    console.log('   • assets/images/apple-touch-icon.png');
    console.log('   • assets/images/android-chrome-192x192.png');
    console.log('   • assets/images/android-chrome-512x512.png');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

async function generateIcoFavicon() {
  // For ICO generation, we'll create multiple sizes and combine them
  const icoSizes = [16, 32, 48];
  // Use the same processed input buffer for consistency
  const inputBuffer = await sharp(config.inputImage)
    .png({ quality: 100, compressionLevel: 9, force: true })
    .toBuffer();
  const pngBuffers = [];

  // Generate PNG buffers for each ICO size
  for (const size of icoSizes) {
    const buffer = await sharp(inputBuffer)
      .resize(size, size, {
        fit: 'contain',
       background: { r: 0, g: 0, b: 0, alpha: 0 },
       withoutEnlargement: false
      })
     .ensureAlpha()
     .png({ 
       quality: 100, 
       compressionLevel: 9,
       adaptiveFiltering: false,
       force: true,
       palette: false
     })
     .png({ 
       quality: 100, 
       compressionLevel: 9,
       force: true,
       palette: false
     })
      .toBuffer();
    
    pngBuffers.push({ size, buffer });
  }

  // Create a simple ICO file structure
  // Note: This is a simplified ICO format. For production, consider using a dedicated ICO library
  const icoBuffer = await createSimpleIco(pngBuffers);
  await fs.writeFile('favicon.ico', icoBuffer);
}

async function createSimpleIco(pngBuffers) {
  // For simplicity, we'll just use the 32x32 PNG as a single-image ICO
  // In a production environment, you might want to use a proper ICO library like 'ico-endec'
  const mainBuffer = pngBuffers.find(p => p.size === 32)?.buffer || pngBuffers[0].buffer;
  
  // ICO header (6 bytes) + directory entry (16 bytes) + PNG data
  const headerSize = 6;
  const directorySize = 16;
  const totalSize = headerSize + directorySize + mainBuffer.length;
  
  const icoBuffer = Buffer.alloc(totalSize);
  let offset = 0;
  
  // ICO header
  icoBuffer.writeUInt16LE(0, offset); // Reserved (must be 0)
  offset += 2;
  icoBuffer.writeUInt16LE(1, offset); // Type (1 = ICO)
  offset += 2;
  icoBuffer.writeUInt16LE(1, offset); // Number of images
  offset += 2;
  
  // Directory entry
  icoBuffer.writeUInt8(32, offset); // Width (0 = 256)
  offset += 1;
  icoBuffer.writeUInt8(32, offset); // Height (0 = 256)
  offset += 1;
  icoBuffer.writeUInt8(0, offset); // Color palette (0 = no palette)
  offset += 1;
  icoBuffer.writeUInt8(0, offset); // Reserved
  offset += 1;
  icoBuffer.writeUInt16LE(1, offset); // Color planes
  offset += 2;
  icoBuffer.writeUInt16LE(32, offset); // Bits per pixel
  offset += 2;
  icoBuffer.writeUInt32LE(mainBuffer.length, offset); // Image data size
  offset += 4;
  icoBuffer.writeUInt32LE(headerSize + directorySize, offset); // Image data offset
  offset += 4;
  
  // PNG data
  mainBuffer.copy(icoBuffer, offset);
  
  return icoBuffer;
}

async function generateWebManifest() {
  const manifest = {
    name: "Fractal Thought Engine",
    short_name: "FTE",
    icons: [
      {
        src: "/assets/images/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/assets/images/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#818cf8",
    background_color: "#111827",
    display: "standalone",
    start_url: "/",
    scope: "/"
  };

  await fs.writeFile('site.webmanifest', JSON.stringify(manifest, null, 2));
  console.log('✅ Created: site.webmanifest');
}

// Enhanced error handling and validation
async function validateDependencies() {
  try {
    require('sharp');
    console.log('✅ Sharp library found');
  } catch (error) {
    console.error('❌ Sharp library not found. Please install it with: npm install sharp');
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🎨 Fractal Thought Engine Favicon Generator');
  console.log('==========================================\n');
  
  await validateDependencies();
  await generateFavicons();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateFavicons, config };