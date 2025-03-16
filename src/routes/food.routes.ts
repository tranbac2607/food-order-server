import { Router } from 'express';
import { getAllFoods, createFood } from '../controllers/food.controller';

const router = Router();

router.get('/', getAllFoods);
router.post('/', createFood);

export default router;
