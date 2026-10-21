import { NewUser, User } from '../interfaces/user.interface';

const users: User[] = [];

const toCopy = (user: User): User => ({ ...user, preferences: [...user.preferences] });

export const findByEmail = (email: string): User | undefined => {
    const user = users.find((u) => u.email === email.toLowerCase());
    return user ? toCopy(user) : undefined;
};

export const findById = (id: number): User | undefined => {
    const user = users.find((u) => u.id === id);
    return user ? toCopy(user) : undefined;
};

export const createUser = (input: NewUser): User => {
    const user: User = {
        id: Math.max(0, ...users.map((u) => u.id)) + 1,
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        preferences: [...input.preferences],
        createdAt: new Date().toISOString(),
    };
    users.push(user);
    return toCopy(user);
};

export const updateUserPreferences = (id: number, preferences: string[]): User | undefined => {
    const user = users.find((u) => u.id === id);
    if (!user) {
        return undefined;
    }
    user.preferences = [...preferences];
    return toCopy(user);
};
