import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { loginHandler, signupHandler, userRoutes } from './user.routes';
import { newsRoutes } from './news.routes';

export const router = Router();

router.use('/users', userRoutes);
router.use('/news', newsRoutes);

router.post('/register', signupHandler);
router.post('/login', loginHandler);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);
