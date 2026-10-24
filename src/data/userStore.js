const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

// Load saved users when the application starts
const loadUsers = () => {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const users = loadUsers();

// Save users to the JSON file
const saveUsers = () => {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

const findUserByEmail = (email) => {
    return users.find((user) => user.email === email);
};

const findUserById = (id) => {
    return users.find((user) => user.id === id);
};

const createUser = (user) => {
    users.push(user);
    saveUsers();
    return user;
};

const updateUserPreferences = (userId, preferences) => {
    const user = findUserById(userId);

    if (!user) {
        return null;
    }

    user.preferences = preferences;
    saveUsers();

    return user;
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserPreferences
};
