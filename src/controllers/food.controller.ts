import { Request, Response } from 'express';
import pool from '../config/db';
import multer from 'multer';

import fs from 'fs';
import path from 'path';

// 📌 Thư mục lưu ảnh
const UPLOADS_FOLDER = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// 🍽️ **Tạo món ăn mới (Hỗ trợ ảnh Base64 từ FE)**
export const createFood = async (req: Request, res: Response) => {
  const { name, description, price, categoryId, available, images } = req.body;

  try {
    // 1️⃣ Thêm món ăn vào bảng foods
    const [result] = await pool.query(
      `INSERT INTO foods (name, description, price, category_id, available) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, categoryId, available]
    );

    const foodId = (result as any).insertId;
    const imagePaths: string[] = [];

    // 2️⃣ Nếu có ảnh, lưu vào thư mục và cập nhật DB
    if (images && images.length > 0) {
      images.forEach((base64Image: string, index: number) => {
        // Tách phần header của base64 (data:image/jpeg;base64,)
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Tạo đường dẫn file ảnh
        const imageName = `food_${foodId}_${index}.jpg`;
        const imagePath = path.join(UPLOADS_FOLDER, imageName);

        // Lưu ảnh vào thư mục
        fs.writeFileSync(imagePath, buffer);
        imagePaths.push(`/uploads/${imageName}`);
      });

      // 3️⃣ Chèn đường dẫn ảnh vào bảng food_images
      const imageValues = imagePaths.map((url) => [foodId, url]);
      await pool.query(
        `INSERT INTO food_images (food_id, image_url) VALUES ?`,
        [imageValues]
      );
    }

    res.status(201).json({
      message: 'Food added successfully',
      foodId,
      imageUrls: imagePaths,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

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

// 🔄 **Cập nhật món ăn (Hỗ trợ ảnh Base64)**
export const updateFood = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, categoryId, available, images } = req.body;

  try {
    // 1️⃣ Cập nhật thông tin món ăn
    await pool.query(
      `UPDATE foods SET name = ?, description = ?, price = ?, category_id = ?, available = ? WHERE id = ?`,
      [name, description, price, categoryId, available, id]
    );

    // 2️⃣ Nếu có ảnh mới, cập nhật lại ảnh
    if (images && images.length > 0) {
      // 🔹 Xóa ảnh cũ trong thư mục
      const [oldImages]: any = await pool.query(
        `SELECT image_url FROM food_images WHERE food_id = ?`,
        [id]
      );
      oldImages.forEach((img: any) => {
        const oldImagePath = path.join(__dirname, '../', img.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      });

      // 🔹 Xóa ảnh cũ trong DB
      await pool.query(`DELETE FROM food_images WHERE food_id = ?`, [id]);

      const imagePaths: string[] = [];

      // 🔹 Lưu ảnh mới
      images.forEach((base64Image: string, index: number) => {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Tạo đường dẫn file ảnh mới
        const imageName = `food_${id}_${index}.jpg`;
        const imagePath = path.join(UPLOADS_FOLDER, imageName);
        fs.writeFileSync(imagePath, buffer);
        imagePaths.push(`/uploads/${imageName}`);
      });

      // 🔹 Lưu đường dẫn ảnh mới vào DB
      const imageValues = imagePaths.map((url) => [id, url]);
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
};
