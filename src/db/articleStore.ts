import { ARTICLE_REGISTRY_MAX } from '../consts/news.consts';
import { Article } from '../interfaces/news.interface';

type Collection = 'read' | 'favorites';

interface UserArticleState {
    read: Map<string, Article>;
    favorites: Map<string, Article>;
}

const registry = new Map<string, Article>();
const states = new Map<number, UserArticleState>();

const toCopy = (article: Article): Article => ({ ...article });

const getState = (userId: number): UserArticleState => {
    let state = states.get(userId);
    if (!state) {
        state = { read: new Map(), favorites: new Map() };
        states.set(userId, state);
    }
    return state;
};

export const rememberArticles = (articles: Article[]): void => {
    articles.forEach((article) => {
        registry.delete(article.id);
        registry.set(article.id, toCopy(article));
    });
    while (registry.size > ARTICLE_REGISTRY_MAX) {
        const oldest = registry.keys().next().value;
        if (oldest === undefined) {
            break;
        }
        registry.delete(oldest);
    }
};

const mark = (userId: number, id: string, collection: Collection): Article | undefined => {
    const state = getState(userId);
    const article = registry.get(id) ?? state.read.get(id) ?? state.favorites.get(id);
    if (!article) {
        return undefined;
    }
    state[collection].set(id, toCopy(article));
    return toCopy(article);
};

export const markRead = (userId: number, id: string): Article | undefined => mark(userId, id, 'read');

export const markFavorite = (userId: number, id: string): Article | undefined => mark(userId, id, 'favorites');

export const listRead = (userId: number): Article[] => [...getState(userId).read.values()].map(toCopy);

export const listFavorites = (userId: number): Article[] => [...getState(userId).favorites.values()].map(toCopy);
