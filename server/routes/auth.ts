import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { hashPassword, verifyPassword, generateToken } from '../middleware/auth';
import { insertUserSchema } from '@shared/schema';

const router = Router();

// Registration endpoint
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8).max(100)
}).omit({ passwordHash: true });

router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName, tiktokBusinessId } = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await storage.createUser({
      email,
      passwordHash,
      companyName,
      tiktokBusinessId
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login endpoint
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    companyName: user.companyName,
    role: user.role,
    tiktokBusinessId: user.tiktokBusinessId
  });
});

// Demo mode validation
router.post('/validate-demo', (req, res) => {
  const { token } = req.body;
  
  if (token && token.startsWith('demo-token-')) {
    return res.json({
      user: {
        id: 1,
        email: 'demo@example.com',
        companyName: 'Demo Company',
        role: 'admin'
      },
      token
    });
  }
  
  res.status(401).json({ message: 'Invalid demo token' });
});

export default router;