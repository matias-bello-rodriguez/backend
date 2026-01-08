const bcrypt = require('bcrypt');

async function generateHashes() {
    const adminPass = 'Admin123!';
    const mechanicPass = 'Mecanico123!';
    
    const adminHash = await bcrypt.hash(adminPass, 10);
    const mechanicHash = await bcrypt.hash(mechanicPass, 10);
    
    console.log('Admin Hash:', adminHash);
    console.log('Mechanic Hash:', mechanicHash);
}

generateHashes();