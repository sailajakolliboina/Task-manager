const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const memoryStore = require('../config/memoryStore');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRole = (role) => {
  return ['ADMIN', 'MEMBER'].includes(role);
};

const authController = {
  signup: async (req, res) => {
    try {
      const { name, email, password, role = 'MEMBER' } = req.body;

      // Validations
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      if (!validateRole(role)) {
        return res.status(400).json({ message: 'Role must be ADMIN or MEMBER' });
      }

      // Check if user exists
      const existingUser = await memoryStore.findUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await memoryStore.createUser({
        name,
        email,
        password: hashedPassword,
        role
      });

      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        token,
        user
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔍 Login attempt:', { email, passwordLength: password?.length });

      // Validations
      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (!validateEmail(email)) {
        console.log('❌ Invalid email format');
        return res.status(400).json({ message: 'Valid email is required' });
      }

      // Find user
      const user = await memoryStore.findUserByEmail(email);
      console.log('🔍 User found:', !!user);
      if (user) {
        console.log('👤 User details:', { id: user.id, email: user.email, hasPassword: !!user.password });
      }

      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      console.log('🔐 Comparing passwords...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match:', isMatch);
      
      if (!isMatch) {
        console.log('❌ Password mismatch');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      console.log('✅ Login successful for:', user.email);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await memoryStore.findUserById(req.user.id);

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;
