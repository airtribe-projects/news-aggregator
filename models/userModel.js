const users = [];
let nextId = 1;

const normalise = (email) => String(email).trim().toLowerCase();

const findByEmail = (email) => users.find((user) => user.email === normalise(email));

const findById = (id) => users.find((user) => user.id === id);

const create = ({ name, email, password, preferences }) => {
    const user = {
        id: nextId++,
        name: name.trim(),
        email: normalise(email),
        password,
        preferences: preferences || [],
        readArticles: [],
        favoriteArticles: [],
        createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
};

const toPublic = ({ id, name, email, preferences, createdAt }) => ({
    id,
    name,
    email,
    preferences,
    createdAt,
});

module.exports = { users, findByEmail, findById, create, toPublic };
