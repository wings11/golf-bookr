import { describe, test, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth.js';
import { db } from '../db.js';
import bcrypt from 'bcrypt';

// Mock the database and bcrypt
vi.mock('../db.js', () => ({
  db: {
    execute: vi.fn()
  }
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashedPassword'),
  compare: vi.fn().mockResolvedValue(true)
}));

// Mock JWT secret for testing
process.env.JWT_SECRET = 'test-secret';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful database insert
    db.execute.mockImplementation((query) => {
      if (query.includes('INSERT INTO')) {
        return Promise.resolve([[{ insertId: 1 }], null]);
      }
      return Promise.resolve([[], null]);
    });
  });

  describe('POST /auth/SignUp', () => {
    const validUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    };

    test('should register a new user successfully', async () => {
      db.execute.mockResolvedValueOnce([[], null]);
      
      const response = await request(app)
        .post('/auth/SignUp')
        .send(validUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/SignUp')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/SignUp')
        .send({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format');
    });

    test('should check for existing users', async () => {
      db.execute.mockResolvedValueOnce([[{ id: 1 }], null]);
      
      const response = await request(app)
        .post('/auth/SignUp')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email or username already exists');
    });
  });

  describe('POST /auth/Login', () => {
    test('should login successfully with valid credentials', async () => {
      db.execute.mockResolvedValueOnce([[{ id: 1, password: 'hashedPassword' }], null]);
      
      const response = await request(app)
        .post('/auth/Login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
      db.execute.mockResolvedValueOnce([[], null]);
      
      const response = await request(app)
        .post('/auth/Login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
