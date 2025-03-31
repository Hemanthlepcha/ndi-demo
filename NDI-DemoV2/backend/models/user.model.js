import pool from '../config/db.config.js';

export class User {
  static async findByID(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id_number = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const result = await pool.query(
        'INSERT INTO users (name, id_number, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [userData.Name, userData.ID]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
} 