import fs from 'fs';
import path from 'path';

/**
 * Split CSV files into smaller chunks with sequential naming
 * @param {string} inputFilePath - Path to the input CSV file
 * @param {number} chunkSize - Number of rows per chunk (default: 2000)
 * @param {object} counter - Object to track the current file number across all files
 */
function splitCSVFile(inputFilePath, chunkSize = 2000, counter) {
    try {
        // Read the file content
        const content = fs.readFileSync(inputFilePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        // Get file info
        const fileName = path.basename(inputFilePath, '.csv');
        const fileDir = path.dirname(inputFilePath);
        
        console.log(`Processing ${fileName}.csv with ${lines.length} lines...`);
        
        // Calculate number of chunks needed
        const totalChunks = Math.ceil(lines.length / chunkSize);
        
        // Split into chunks
        for (let i = 0; i < totalChunks; i++) {
            const startIndex = i * chunkSize;
            const endIndex = Math.min(startIndex + chunkSize, lines.length);
            const chunk = lines.slice(startIndex, endIndex);
            
            // Create output filename with sequential numbering: malicious_X_10k.csv
            const outputFileName = `malicious_${counter.current}_10k.csv`;
            const outputFilePath = path.join(fileDir, outputFileName);
            
            // Write chunk to file
            fs.writeFileSync(outputFilePath, chunk.join('\n') + '\n');
            
            console.log(`Created: ${outputFileName} (${chunk.length} rows)`);
            
            // Increment counter for next file
            counter.current++;
        }
        
        console.log(`✓ Successfully split ${fileName}.csv into ${totalChunks} files`);
        
    } catch (error) {
        console.error(`Error processing ${inputFilePath}:`, error.message);
    }
}

// Main execution
function main() {
    const uploadsDir = './uploads';
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
        console.error('Uploads directory not found!');
        return;
    }
    
    // Get all CSV files in uploads directory (only the original ones)
    const files = fs.readdirSync(uploadsDir)
        .filter(file => file.endsWith('.csv') && file.startsWith('malicious_'))
        .sort()
        .map(file => path.join(uploadsDir, file));
    
    if (files.length === 0) {
        console.log('No original CSV files found in uploads directory.');
        return;
    }
    
    console.log(`Found ${files.length} CSV file(s) to process...\n`);
    
    // Initialize counter starting from 8 (since we'll create files starting from malicious_8)
    const counter = { current: 8 };
    
    // Process each file
    files.forEach((filePath, index) => {
        console.log(`\n--- Processing file ${index + 1}/${files.length} ---`);
        splitCSVFile(filePath, 2000, counter);
    });
    
    console.log('\n🎉 All files processed successfully!');
    console.log(`Files created with sequential numbering from malicious_8_10k.csv onwards`);
}

// Run the script
main();
