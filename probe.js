const fs = require('fs');
fs.writeFileSync('probe-result.txt', 'node-ok\n');
console.log('probe-written');
