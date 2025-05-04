// Temporary function to find and replace the body JSON
const fs = require('fs');
const filePath = '/Users/fjmoreno72/WORK/IONIC3/app/static/js/pages/cis_api.js';

let content = fs.readFileSync(filePath, 'utf8');

// Find the specific section to replace
const searchPattern = `body: JSON.stringify({
          instanceLabel: instanceLabel,
          serviceId: serviceId,
        }),`;

const replacement = `body: JSON.stringify({
          instanceLabel: instanceLabel,
          serviceId: serviceId,
          gpid: gpId
        }),`;

// Replace the content
content = content.replace(searchPattern, replacement);

// Save back to the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully');
