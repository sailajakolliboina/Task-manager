import http from 'http';

// Test users to create
const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN'
  },
  {
    name: 'Member User', 
    email: 'member@test.com',
    password: 'member123',
    role: 'MEMBER'
  },
  {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    role: 'ADMIN'
  }
];

// Function to make HTTP request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createTestUsers() {
  try {
    console.log('👥 Creating Test Users...\n');

    for (const user of testUsers) {
      console.log(`Creating user: ${user.email}`);
      
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      try {
        const response = await makeRequest(options, user);
        console.log(`✅ ${user.email}: ${response.statusCode}`);
        if (response.data.success) {
          console.log(`   User ID: ${response.data.user.id}`);
          console.log(`   Name: ${response.data.user.name}`);
          console.log(`   Role: ${response.data.user.role}`);
        }
      } catch (error) {
        if (error.message.includes('User already exists')) {
          console.log(`✅ ${user.email}: Already exists`);
        } else {
          console.log(`❌ ${user.email}: ${error.message}`);
        }
      }
      console.log('');
    }

    console.log('🎉 Test users created successfully!');
    console.log('');
    console.log('📱 Available test credentials:');
    testUsers.forEach(user => {
      console.log(`   ${user.email} / ${user.password} (${user.role})`);
    });
    console.log('');
    console.log('🌐 Now try logging in at: http://localhost:5173');

  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
  }
}

createTestUsers();
