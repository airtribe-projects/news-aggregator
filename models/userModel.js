const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/users.json');

// Creates an empty users file on first run
const initDataFile = async () => {
    try {
        await fs.promises.access(filePath);
    } catch {
        await fs.promises.writeFile(filePath, '[]');
    }
};

const readAll = async () => {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
};

const writeAll = async (users) => {
    await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2));
};

module.exports = { initDataFile, readAll, writeAll };
