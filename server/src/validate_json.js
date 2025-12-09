
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

console.log('Checking JSON files in:', dataDir);

try {
    const files = fs.readdirSync(dataDir);
    let errorCount = 0;

    files.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(dataDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                console.log(`[OK] ${file}`);
            } catch (err) {
                console.error(`[ERROR] ${file} is invalid JSON:`, err.message);
                errorCount++;
            }
        }
    });

    if (errorCount > 0) {
        console.log(`\nFound ${errorCount} invalid JSON files.`);
        process.exit(1);
    } else {
        console.log('\nAll JSON files are valid.');
    }

} catch (err) {
    console.error('Failed to read data directory:', err);
    process.exit(1);
}
