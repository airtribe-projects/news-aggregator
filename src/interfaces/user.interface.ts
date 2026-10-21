export interface User {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    preferences: string[];
    createdAt: string;
}

export type NewUser = Omit<User, 'id' | 'createdAt'>;

export interface SignupInput {
    name: string;
    email: string;
    password: string;
    preferences: string[];
}

export interface LoginInput {
    email: string;
    password: string;
}
