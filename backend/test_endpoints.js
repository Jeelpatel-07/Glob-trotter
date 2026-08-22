import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  let testUserToken = null;
  const uniqueEmail = `test.traveler.${Date.now()}@example.com`;

  // Test 1: Successful Registration
  try {
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Traveler',
        email: uniqueEmail,
        password: 'password123',
        phone: '+15550199',
        city: 'Seattle',
        country: 'United States',
        additionalInfo: 'Love nature hikes'
      })
    });
    const signupData = await signupRes.json();
    assert.strictEqual(signupRes.status, 201, 'Signup status should be 201');
    assert.strictEqual(signupData.message, 'Account created successfully', 'Signup message mismatch');
    console.log('✅ Test 1: Signup successful');
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    process.exit(1);
  }

  // Test 2: Duplicate Email Registration
  try {
    const duplicateRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Traveler',
        email: uniqueEmail,
        password: 'password123'
      })
    });
    const duplicateData = await duplicateRes.json();
    assert.strictEqual(duplicateRes.status, 409, 'Duplicate signup status should be 409');
    assert.ok(duplicateData.message.includes('exists'), 'Duplicate signup error message mismatch');
    console.log('✅ Test 2: Duplicate email validation handles correctly');
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    process.exit(1);
  }

  // Test 3: Invalid Registration Input (Short Password)
  try {
    const invalidRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Traveler',
        email: 'invalid@example.com',
        password: '123' // too short
      })
    });
    assert.strictEqual(invalidRes.status, 400, 'Invalid signup status should be 400');
    console.log('✅ Test 3: Input validation handles correctly');
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    process.exit(1);
  }

  // Test 4: Successful Login
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, 'Login status should be 200');
    assert.ok(loginData.data.token, 'Token not returned');
    assert.strictEqual(loginData.data.user.email, uniqueEmail, 'User email mismatch');
    assert.strictEqual(loginData.data.user.firstName, 'Test', 'User firstName mismatch');
    testUserToken = loginData.data.token;
    console.log('✅ Test 4: Login successful');
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    process.exit(1);
  }

  // Test 5: Wrong Password Login
  try {
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'wrongpassword'
      })
    });
    assert.strictEqual(wrongPassRes.status, 401, 'Wrong password login status should be 401');
    console.log('✅ Test 5: Wrong password login fails correctly');
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    process.exit(1);
  }

  // Test 6: Access Protected Profile without JWT
  try {
    const profileNoTokenRes = await fetch(`${BASE_URL}/users/me`);
    assert.strictEqual(profileNoTokenRes.status, 401, 'Protected profile without token should be 401');
    console.log('✅ Test 6: Accessing profile without token rejected');
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    process.exit(1);
  }

  // Test 7: Get Current User profile with JWT
  try {
    const profileRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const profileData = await profileRes.json();
    assert.strictEqual(profileRes.status, 200, 'Profile status should be 200');
    assert.strictEqual(profileData.data.email, uniqueEmail, 'Profile email mismatch');
    assert.strictEqual(profileData.data.city, 'Seattle', 'Profile city mismatch');
    console.log('✅ Test 7: Fetch current user profile successful');
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    process.exit(1);
  }

  // Test 8: Update User Profile
  try {
    const updateRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        firstName: 'UpdatedName',
        city: 'Portland'
      })
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 200, 'Update profile status should be 200');
    assert.strictEqual(updateData.data.firstName, 'UpdatedName', 'Updated firstName mismatch');
    assert.strictEqual(updateData.data.city, 'Portland', 'Updated city mismatch');
    console.log('✅ Test 8: Update profile successful');
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    process.exit(1);
  }

  // Test 9: Delete Account
  try {
    const deleteRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    const deleteData = await deleteRes.json();
    assert.strictEqual(deleteRes.status, 200, 'Delete account status should be 200');
    assert.strictEqual(deleteData.message, 'Account deleted successfully', 'Delete message mismatch');

    // Confirm user is deleted from database
    const verifyDeleteRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    assert.strictEqual(verifyDeleteRes.status, 401, 'Get deleted profile should return 401');
    console.log('✅ Test 9: Delete account successful and validated');
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 All 9 Integration Tests Completed Successfully!\n');
}

runTests();
