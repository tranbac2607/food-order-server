import { Request, Response } from 'express';
import db from '../config/db';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.json({ id: (result as any).insertId, name, email });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export default { getAllUsers, createUser };
