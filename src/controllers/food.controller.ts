import { Request, Response } from 'express';
import pool from '../config/db';

export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const [foods] = await pool.query('SELECT * FROM foods');
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createFood = async (req: Request, res: Response) => {
  const { name, description, price, category_id, image } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO foods (name, description, price, category_id, image) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, category_id, image]
    );
    res.status(201).json({
      message: 'Food added successfully',
      foodId: (result as any).insertId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
