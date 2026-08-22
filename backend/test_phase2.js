const BASE_URL = 'http://localhost:5000';

let token1 = '';
let user1 = null;
let token2 = '';
let user2 = null;
let tripId = null;
let stop1Id = null;
let stop2Id = null;
let cityId = null;

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n🚀 STARTING GLOBETROTTER PHASE 1 & 2 AUTOMATED TEST SUITE\n');

  console.log('--- 1. HEALTH & PHASE 1 AUTH ---');
  await test('GET /health', async () => {
    const res = await request('/health');
    assert(res.status === 200, `Expected 200 got ${res.status}`);
    assert(res.data.status === 'ok', 'Status not ok');
    assert(res.data.database === 'connected', 'Database not connected');
  });

  const timestamp = Date.now();
  await test('POST /api/auth/signup (User 1)', async () => {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: {
        firstName: 'Test',
        lastName: 'Traveler',
        email: `test.${timestamp}@example.com`,
        password: 'password123',
        city: 'London',
        country: 'UK',
      },
    });
    assert(res.status === 200 || res.status === 201, `Expected 200/201 got ${res.status}`);
    assert(res.data.message, 'No message returned');
  });

  await test('POST /api/auth/login (User 1)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: `test.${timestamp}@example.com`,
        password: 'password123',
      },
    });
    assert(res.status === 200, `Expected 200 got ${res.status}`);
    assert(res.data.data?.token, 'No token in response');
    token1 = res.data.data.token;
    user1 = res.data.data.user;
  });

  await test('POST /api/auth/signup & login (User 2 for ownership checks)', async () => {
    await request('/api/auth/signup', {
      method: 'POST',
      body: {
        firstName: 'Other',
        lastName: 'User',
        email: `other.${timestamp}@example.com`,
        password: 'password123',
      },
    });
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: `other.${timestamp}@example.com`,
        password: 'password123',
      },
    });
    assert(res.status === 200);
    token2 = res.data.data.token;
    user2 = res.data.data.user;
  });

  await test('GET /api/users/me', async () => {
    const res = await request('/api/users/me', { token: token1 });
    assert(res.status === 200, `Expected 200 got ${res.status}`);
    assert(res.data.data?.email === `test.${timestamp}@example.com`, 'User data mismatch');
  });

  console.log('\n--- 2. CITIES (PHASE 2) ---');
  await test('GET /api/cities (List all / most popular)', async () => {
    const res = await request('/api/cities', { token: token1 });
    assert(res.status === 200, `Expected 200 got ${res.status}`);
    assert(Array.isArray(res.data.data) && res.data.data.length > 0, 'No cities returned');
    cityId = res.data.data[0].id;
  });

  await test('GET /api/cities?search=paris (Search city)', async () => {
    const res = await request('/api/cities?search=paris', { token: token1 });
    assert(res.status === 200);
    assert(res.data.data.some(c => c.name.toLowerCase() === 'paris'), 'Paris not found in search');
  });

  await test('GET /api/cities?region=Europe (Filter region)', async () => {
    const res = await request('/api/cities?region=Europe', { token: token1 });
    assert(res.status === 200);
    assert(res.data.data.every(c => c.region === 'Europe'), 'Non-Europe city returned');
  });

  await test('GET /api/cities/:cityId', async () => {
    const res = await request(`/api/cities/${cityId}`, { token: token1 });
    assert(res.status === 200);
    assert(res.data.data.id === cityId, 'City ID mismatch');
  });

  console.log('\n--- 3. TRIPS CRUD & OWNERSHIP (PHASE 2) ---');
  await test('POST /api/trips (Create Trip)', async () => {
    const res = await request('/api/trips', {
      method: 'POST',
      token: token1,
      body: {
        name: 'Euro Trip 2026',
        description: 'Exploring France and Italy',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
        budget: 3500,
      },
    });
    assert(res.status === 201, `Expected 201 got ${res.status}`);
    assert(res.data.data?.id, 'No trip ID returned');
    tripId = res.data.data.id;
  });

  await test('POST /api/trips (Validation: End date before start date)', async () => {
    const res = await request('/api/trips', {
      method: 'POST',
      token: token1,
      body: {
        name: 'Invalid Trip',
        startDate: '2026-09-10',
        endDate: '2026-09-01',
      },
    });
    assert(res.status === 400, `Expected 400 validation error got ${res.status}`);
  });

  await test('GET /api/trips (Get User Trips)', async () => {
    const res = await request('/api/trips', { token: token1 });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length >= 1, 'Trips list empty');
  });

  await test('GET /api/trips/:tripId (Get Single Trip)', async () => {
    const res = await request(`/api/trips/${tripId}`, { token: token1 });
    assert(res.status === 200);
    assert(res.data.data.name === 'Euro Trip 2026');
  });

  await test('GET /api/trips/:tripId (Security: User 2 cannot access private trip of User 1)', async () => {
    const res = await request(`/api/trips/${tripId}`, { token: token2 });
    assert(res.status === 403, `Expected 403 forbidden got ${res.status}`);
  });

  await test('PUT /api/trips/:tripId (Update Trip)', async () => {
    const res = await request(`/api/trips/${tripId}`, {
      method: 'PUT',
      token: token1,
      body: {
        name: 'Euro Trip 2026 Updated',
        budget: 4000,
      },
    });
    assert(res.status === 200);
    assert(res.data.data.name === 'Euro Trip 2026 Updated');
    assert(res.data.data.budget === 4000);
  });

  await test('PUT /api/trips/:tripId (Security: User 2 cannot update User 1 trip)', async () => {
    const res = await request(`/api/trips/${tripId}`, {
      method: 'PUT',
      token: token2,
      body: { name: 'Hacked' },
    });
    assert(res.status === 403, `Expected 403 got ${res.status}`);
  });

  console.log('\n--- 4. TRIP STOPS & REORDERING (PHASE 2) ---');
  await test('POST /api/trips/:tripId/stops (Add Stop 1: Paris)', async () => {
    const res = await request(`/api/trips/${tripId}/stops`, {
      method: 'POST',
      token: token1,
      body: {
        cityId: cityId,
        cityName: 'Paris',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 1500,
      },
    });
    assert(res.status === 201, `Expected 201 got ${res.status}`);
    assert(res.data.data?.id, 'No stop ID');
    stop1Id = res.data.data.id;
  });

  await test('POST /api/trips/:tripId/stops (Add Stop 2: Rome)', async () => {
    const res = await request(`/api/trips/${tripId}/stops`, {
      method: 'POST',
      token: token1,
      body: {
        cityName: 'Rome',
        startDate: '2026-09-06',
        endDate: '2026-09-10',
        budget: 1200,
      },
    });
    assert(res.status === 201);
    stop2Id = res.data.data.id;
  });

  await test('GET /api/trips/:tripId/stops (List Stops)', async () => {
    const res = await request(`/api/trips/${tripId}/stops`, { token: token1 });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length === 2, 'Expected 2 stops');
  });

  await test('PUT /api/stops/:stopId (Update Stop)', async () => {
    const res = await request(`/api/stops/${stop1Id}`, {
      method: 'PUT',
      token: token1,
      body: {
        budget: 1800,
        notes: 'Hotel near Eiffel Tower',
      },
    });
    assert(res.status === 200);
    assert(res.data.data.budget === 1800);
  });

  await test('PATCH /api/trips/:tripId/stops/reorder (Reorder Stops)', async () => {
    const res = await request(`/api/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      token: token1,
      body: {
        stops: [
          { id: stop2Id, order: 0 },
          { id: stop1Id, order: 1 },
        ],
      },
    });
    assert(res.status === 200);
    assert(res.data.data[0].id === stop2Id, 'Stop 2 should now be first');
  });

  await test('PATCH /api/trips/:tripId/stops/reorder (Security: User 2 cannot reorder User 1 stops)', async () => {
    const res = await request(`/api/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      token: token2,
      body: {
        stops: [{ id: stop1Id, order: 0 }],
      },
    });
    assert(res.status === 403);
  });

  console.log('\n--- 5. CORE ITINERARY & DASHBOARD (PHASE 2) ---');
  await test('GET /api/trips/:tripId/itinerary (Get Complete Itinerary)', async () => {
    const res = await request(`/api/trips/${tripId}/itinerary`, { token: token1 });
    assert(res.status === 200);
    assert(res.data.data.trip?.name === 'Euro Trip 2026 Updated');
    assert(Array.isArray(res.data.data.days) && res.data.data.days.length > 0, 'No days generated');
    assert(Array.isArray(res.data.data.stops) && res.data.data.stops.length === 2, 'Stops missing');
  });

  await test('GET /api/dashboard (Get Dashboard Data)', async () => {
    const res = await request('/api/dashboard', { token: token1 });
    assert(res.status === 200);
    assert(res.data.data.stats?.total >= 1, 'Stats total mismatch');
    assert(Array.isArray(res.data.data.recentTrips), 'Recent trips missing');
    assert(Array.isArray(res.data.data.popularCities), 'Popular cities missing');
  });

  console.log('\n--- 6. DELETE OPERATIONS (PHASE 2) ---');
  await test('DELETE /api/stops/:stopId (Delete Stop 2)', async () => {
    const res = await request(`/api/stops/${stop2Id}`, {
      method: 'DELETE',
      token: token1,
    });
    assert(res.status === 200);
  });

  await test('DELETE /api/trips/:tripId (Security: User 2 cannot delete User 1 trip)', async () => {
    const res = await request(`/api/trips/${tripId}`, {
      method: 'DELETE',
      token: token2,
    });
    assert(res.status === 403);
  });

  await test('DELETE /api/trips/:tripId (Delete Trip)', async () => {
    const res = await request(`/api/trips/${tripId}`, {
      method: 'DELETE',
      token: token1,
    });
    assert(res.status === 200);
  });

  console.log(`\n==============================================`);
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
