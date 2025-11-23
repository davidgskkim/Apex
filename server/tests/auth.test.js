const request = require('supertest');
const app = require('../index'); 
const sql = require('../db'); 

describe('Auth Endpoints', () => {
  
  // Test Login Route 
  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'fake_user_999@example.com',
        password: 'wrongpassword123'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  // Test Exercises Route 
  it('should block unauthorized access to exercises', async () => {
    const res = await request(app).get('/api/exercises');
    
    expect(res.statusCode).not.toEqual(200);
  });

  // Close database connection after tests
  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });
});