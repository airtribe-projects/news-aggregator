import axios from 'axios';
import { createHash } from 'crypto';
import { env } from '../config/env';
import { GNEWS_BASE_URL, GNEWS_TIMEOUT_MS } from '../consts/news.consts';
import { rememberArticles } from '../db/articleStore';
import { eHttpStatusCode } from '../enums/server.enums';
import { Article, NewsQuery } from '../interfaces/news.interface';
import { createError } from '../utils/appError';
import { getCached, setCached } from './cache.service';

type Endpoint = 'search' | 'top-headlines';
type Params = Record<string, string | number>;

interface GNewsArticle {
    title?: string;
    description?: string;
    url?: string;
    image?: string | null;
    publishedAt?: string;
    source?: { name?: string };
}

interface TrackedQuery {
    endpoint: Endpoint;
    params: Params;
    lastRequestedAt: number;
}

const trackedQueries = new Map<string, TrackedQuery>();

const toArticle = (raw: GNewsArticle): Article => {
    const url = raw.url ?? '';
    return {
        id: createHash('sha256').update(url).digest('hex').slice(0, 16),
        title: raw.title ?? '',
        description: raw.description ?? '',
        url,
        image: raw.image ?? null,
        publishedAt: raw.publishedAt ?? '',
        source: raw.source?.name ?? '',
    };
};

const quote = (term: string): string => `"${term.replace(/"/g, '')}"`;

const toServiceError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        if (status === eHttpStatusCode.TOO_MANY_REQUESTS) {
            return createError(eHttpStatusCode.TOO_MANY_REQUESTS, 'News provider rate limit reached, try again later');
        }
        if (status === eHttpStatusCode.UNAUTHORIZED || status === 403) {
            return createError(eHttpStatusCode.BAD_GATEWAY, 'News provider rejected the API credentials');
        }
    }
    return createError(eHttpStatusCode.BAD_GATEWAY, 'Failed to fetch news from the provider');
};

const requestArticles = async (endpoint: Endpoint, params: Params): Promise<Article[]> => {
    const response = await axios.get<{ articles?: GNewsArticle[] }>(`${GNEWS_BASE_URL}/${endpoint}`, {
        params: { ...params, apikey: env.newsApiKey },
        timeout: GNEWS_TIMEOUT_MS,
    });
    const articles = (response.data.articles ?? []).map(toArticle);
    rememberArticles(articles);
    return articles;
};

const loadArticles = async (cacheKey: string, endpoint: Endpoint, params: Params): Promise<Article[]> => {
    if (!env.newsApiKey) {
        throw createError(eHttpStatusCode.INTERNAL_SERVER_ERROR, 'News service is not configured');
    }

    trackedQueries.set(cacheKey, { endpoint, params, lastRequestedAt: Date.now() });

    const cached = getCached<Article[]>(cacheKey);
    if (cached) {
        rememberArticles(cached);
        return cached;
    }

    try {
        const articles = await requestArticles(endpoint, params);
        setCached(cacheKey, articles);
        return articles;
    } catch (error) {
        throw toServiceError(error);
    }
};

export const fetchNews = async (preferences: string[], { language, limit }: NewsQuery): Promise<Article[]> => {
    const term = preferences.map(quote).join(' OR ');
    const cacheKey = `news:${language}:${limit}:${term}`;
    const params: Params = { lang: language, max: limit };
    if (term) {
        params.q = term;
    }
    return loadArticles(cacheKey, term ? 'search' : 'top-headlines', params);
};

export const searchNews = async (keyword: string, { language, limit }: NewsQuery): Promise<Article[]> => {
    const cacheKey = `search:${language}:${limit}:${keyword.toLowerCase()}`;
    return loadArticles(cacheKey, 'search', { lang: language, max: limit, q: quote(keyword) });
};

export const refreshTrackedQueries = async (maxIdleMs: number): Promise<void> => {
    const cutoff = Date.now() - maxIdleMs;
    for (const [cacheKey, query] of [...trackedQueries]) {
        if (query.lastRequestedAt < cutoff) {
            trackedQueries.delete(cacheKey);
            continue;
        }
        try {
            setCached(cacheKey, await requestArticles(query.endpoint, query.params));
        } catch (error) {
            console.error(`Cache refresh failed for ${cacheKey}`, toServiceError(error).message);
        }
    }
};
