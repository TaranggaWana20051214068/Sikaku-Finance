const fs = require('fs');

function inspectFile(filePath) {
  console.log('====================================');
  console.log('FILE:', filePath);
  console.log('====================================');
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Extract all rows
  const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  console.log('Total TR rows:', trMatches.length);

  trMatches.slice(0, 60).forEach((tr, index) => {
    const cells = (tr.match(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      .filter(t => t.length > 0 && !t.startsWith('.SSparkchart'));
    
    if (cells.length > 0) {
      console.log(`Row ${index + 1}: ${cells.join(' | ')}`);
    }
  });
}

inspectFile('Copy of TEMPLATE NEW.html');
inspectFile('Q4 2024.html');
