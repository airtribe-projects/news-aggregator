import { Request, Response } from 'express';
import * as articleStore from '../db/articleStore';
import * as userStore from '../db/userStore';
import { eHttpStatusCode, eResponseStatus } from '../enums/server.enums';
import { fetchNews, searchNews } from '../services/news.service';
import { createError } from '../utils/appError';
import { validateArticleId, validateKeyword, validateNewsQuery } from '../validators/news.validator';

export const getNews = async (req: Request, res: Response): Promise<void> => {
    const query = validateNewsQuery(req.query);

    const user = userStore.findById(res.locals.userId);
    if (!user) {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Invalid or expired token');
    }

    const news = await fetchNews(user.preferences, query);

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, news });
};

export const searchByKeyword = async (req: Request, res: Response): Promise<void> => {
    const keyword = validateKeyword(req.params.keyword);
    const query = validateNewsQuery(req.query);

    const news = await searchNews(keyword, query);

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, news });
};

export const markAsRead = (req: Request, res: Response): void => {
    const article = articleStore.markRead(res.locals.userId, validateArticleId(req.params.id));
    if (!article) {
        throw createError(eHttpStatusCode.NOT_FOUND, 'Article not found');
    }

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, article });
};

export const markAsFavorite = (req: Request, res: Response): void => {
    const article = articleStore.markFavorite(res.locals.userId, validateArticleId(req.params.id));
    if (!article) {
        throw createError(eHttpStatusCode.NOT_FOUND, 'Article not found');
    }

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, article });
};

export const getRead = (_req: Request, res: Response): void => {
    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, news: articleStore.listRead(res.locals.userId) });
};

export const getFavorites = (_req: Request, res: Response): void => {
    res.status(eHttpStatusCode.OK).json({
        status: eResponseStatus.SUCCESS,
        news: articleStore.listFavorites(res.locals.userId),
    });
};
