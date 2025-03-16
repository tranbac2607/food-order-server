import { Request, Response } from 'express';
import pool from '../config/db';
import multer from 'multer';

// Cấu hình multer để nhận file
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🥘 Lấy danh sách tất cả món ăn (kèm ảnh)
export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const [foods] = await pool.query(`
      SELECT 
        f.id, f.name, f.description, f.price, f.category_id, f.created_by,
        JSON_ARRAYAGG(i.image_url) AS images 
      FROM foods f
      LEFT JOIN food_images i ON f.id = i.food_id
      GROUP BY f.id
    `);

    res.json(foods);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 🍽️ Tạo món ăn mới (hỗ trợ upload ảnh)
export const createFood = async (req: Request, res: Response) => {
  upload.array('images', 5)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'File upload error' });

    const { name, description, price, category_id, created_by } = req.body;
    const images = req.files as Express.Multer.File[];

    try {
      // 1️⃣ Thêm món ăn vào bảng foods
      const [result] = await pool.query(
        `INSERT INTO foods (name, description, price, category_id, created_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, price, category_id, created_by]
      );

      const foodId = (result as any).insertId;

      // 2️⃣ Nếu có ảnh, lưu vào bảng food_images
      if (images.length > 0) {
        const imageValues = images.map((file) => [foodId, file.originalname]); // Lưu tên file vào DB
        await pool.query(
          `INSERT INTO food_images (food_id, image_url) VALUES ?`,
          [imageValues]
        );
      }

      res.status(201).json({
        message: 'Food added successfully',
        foodId,
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
};

// 🔄 Cập nhật món ăn (hỗ trợ cập nhật ảnh)
export const updateFood = async (req: Request, res: Response) => {
  upload.array('images', 5)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'File upload error' });

    const { id } = req.params;
    const { name, description, price, category_id } = req.body;
    const images = req.files as Express.Multer.File[];

    try {
      // 1️⃣ Cập nhật thông tin món ăn
      await pool.query(
        `UPDATE foods SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?`,
        [name, description, price, category_id, id]
      );

      // 2️⃣ Nếu có ảnh mới, cập nhật lại ảnh
      if (images.length > 0) {
        await pool.query(`DELETE FROM food_images WHERE food_id = ?`, [id]);

        const imageValues = images.map((file) => [id, file.originalname]);
        await pool.query(
          `INSERT INTO food_images (food_id, image_url) VALUES ?`,
          [imageValues]
        );
      }

      res.json({ message: 'Food updated successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
};
