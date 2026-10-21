import { Router } from 'express';
import { getPreferences, login, signup, updatePreferences } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const signupHandler = asyncHandler(signup);
export const loginHandler = asyncHandler(login);

export const userRoutes = Router();

userRoutes.post('/signup', signupHandler);
userRoutes.post('/login', loginHandler);
userRoutes.get('/preferences', authenticate, getPreferences);
userRoutes.put('/preferences', authenticate, updatePreferences);
