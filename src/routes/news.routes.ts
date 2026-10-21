import { Router } from 'express';
import {
    getFavorites,
    getNews,
    getRead,
    markAsFavorite,
    markAsRead,
    searchByKeyword,
} from '../controllers/news.controller';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const newsRoutes = Router();

newsRoutes.use(authenticate);

newsRoutes.get('/', asyncHandler(getNews));
newsRoutes.get('/read', getRead);
newsRoutes.get('/favorites', getFavorites);
newsRoutes.get('/search/:keyword', asyncHandler(searchByKeyword));
newsRoutes.post('/:id/read', markAsRead);
newsRoutes.post('/:id/favorite', markAsFavorite);
