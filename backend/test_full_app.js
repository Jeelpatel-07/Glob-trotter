const BASE_URL = 'http://localhost:5000';

let tokenUser = '';
let tokenAdmin = '';
let tokenOther = '';
let tripId = null;
let stop1Id = null;
let stop2Id = null;
let activityId = null;
let tripActivity1Id = null;
let shareToken = '';
let copiedTripId = null;
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
  console.log('\n=============================================================');
  console.log('🚀 GLOBETROTTER FULL-STACK E2E TEST SUITE (PHASES 1, 2, 3 & 4)');
  console.log('=============================================================\n');

  console.log('--- 1. SYSTEM HEALTH & AUTHENTICATION (PHASE 1) ---');
  await test('GET /health (Server & DB Connected)', async () => {
    const res = await request('/health');
    assert(res.status === 200);
    assert(res.data.status === 'ok');
    assert(res.data.database === 'connected');
  });

  const ts = Date.now();
  await test('POST /api/auth/signup (Register Traveler)', async () => {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: {
        firstName: 'Elena',
        lastName: 'Rostova',
        email: `elena.${ts}@example.com`,
        password: 'password123',
        city: 'Paris',
        country: 'France',
      },
    });
    assert(res.status === 200 || res.status === 201);
  });

  await test('POST /api/auth/login (Traveler Login -> Receive JWT)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: `elena.${ts}@example.com`, password: 'password123' },
    });
    assert(res.status === 200);
    assert(res.data.data?.token);
    tokenUser = res.data.data.token;
  });

  await test('POST /api/auth/login (Admin Login -> Verify ADMIN role)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@globetrotter.io', password: 'password123' },
    });
    assert(res.status === 200);
    assert(res.data.data?.user?.role === 'ADMIN');
    tokenAdmin = res.data.data.token;
  });

  await test('POST /api/auth/signup & login (Other User for Security Tests)', async () => {
    await request('/api/auth/signup', {
      method: 'POST',
      body: { firstName: 'Other', lastName: 'User', email: `other.${ts}@example.com`, password: 'password123' },
    });
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: `other.${ts}@example.com`, password: 'password123' },
    });
    assert(res.status === 200);
    tokenOther = res.data.data.token;
  });

  await test('GET /api/users/me (Fetch Authenticated Profile)', async () => {
    const res = await request('/api/users/me', { token: tokenUser });
    assert(res.status === 200);
    assert(res.data.data?.email === `elena.${ts}@example.com`);
  });

  console.log('\n--- 2. CITIES & ACTIVITIES EXPLORATION (PHASE 2 & 3) ---');
  await test('GET /api/cities (List Destinations with Filters)', async () => {
    const res = await request('/api/cities?region=Europe&sort=popularity', { token: tokenUser });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length > 0);
    cityId = res.data.data[0].id;
  });

  await test('GET /api/activities (List Activities with Search & Category)', async () => {
    const res = await request('/api/activities?category=culture&sort=rating', { token: tokenUser });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length > 0);
    activityId = res.data.data[0].id;
  });

  await test('GET /api/activities/:activityId', async () => {
    const res = await request(`/api/activities/${activityId}`, { token: tokenUser });
    assert(res.status === 200);
    assert(res.data.data?.name);
  });

  console.log('\n--- 3. TRIPS & STOPS CRUD (PHASE 2) ---');
  await test('POST /api/trips (Create Trip)', async () => {
    const res = await request('/api/trips', {
      method: 'POST',
      token: tokenUser,
      body: {
        name: 'Grand Mediterranean Tour 2026',
        description: 'From Paris to Rome with fine art and food',
        startDate: '2026-10-01',
        endDate: '2026-10-10',
        budget: 3500,
        coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
      },
    });
    assert(res.status === 201);
    tripId = res.data.data.id;
  });

  await test('POST /api/trips/:tripId/stops (Add Stop 1: Paris)', async () => {
    const res = await request(`/api/trips/${tripId}/stops`, {
      method: 'POST',
      token: tokenUser,
      body: {
        cityId,
        cityName: 'Paris',
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        budget: 1500,
      },
    });
    assert(res.status === 201);
    stop1Id = res.data.data.id;
  });

  await test('POST /api/trips/:tripId/stops (Add Stop 2: Rome)', async () => {
    const res = await request(`/api/trips/${tripId}/stops`, {
      method: 'POST',
      token: tokenUser,
      body: {
        cityName: 'Rome',
        startDate: '2026-10-06',
        endDate: '2026-10-10',
        budget: 1200,
      },
    });
    assert(res.status === 201);
    stop2Id = res.data.data.id;
  });

  await test('PATCH /api/trips/:tripId/stops/reorder (DnD Stop Reordering)', async () => {
    const res = await request(`/api/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      token: tokenUser,
      body: {
        stops: [
          { id: stop1Id, order: 0 },
          { id: stop2Id, order: 1 },
        ],
      },
    });
    assert(res.status === 200);
  });

  console.log('\n--- 4. PLANNED ACTIVITIES IN STOPS (PHASE 3) ---');
  await test('POST /api/stops/:stopId/activities (Add Activity to Stop 1)', async () => {
    const res = await request(`/api/stops/${stop1Id}/activities`, {
      method: 'POST',
      token: tokenUser,
      body: {
        name: 'Eiffel Tower Sunset Experience',
        cost: 65,
        category: 'sightseeing',
        time: '06:00 PM',
      },
    });
    assert(res.status === 201);
    assert(res.data.data?.id);
    tripActivity1Id = res.data.data.id;
  });

  await test('POST /api/stops/:stopId/activities (Add Activity 2 from Catalog)', async () => {
    const res = await request(`/api/stops/${stop1Id}/activities`, {
      method: 'POST',
      token: tokenUser,
      body: {
        activityId,
        time: '11:00 AM',
      },
    });
    assert(res.status === 201);
  });

  await test('PUT /api/trip-activities/:tripActivityId (Update Activity)', async () => {
    const res = await request(`/api/trip-activities/${tripActivity1Id}`, {
      method: 'PUT',
      token: tokenUser,
      body: { cost: 75, time: '06:30 PM' },
    });
    assert(res.status === 200);
    assert(res.data.data.cost === 75);
  });

  await test('Security: User cannot modify activities of another user', async () => {
    const res = await request(`/api/trip-activities/${tripActivity1Id}`, {
      method: 'PUT',
      token: tokenOther,
      body: { cost: 999 },
    });
    assert(res.status === 403);
  });

  console.log('\n--- 5. ITINERARY, BUDGET & CALENDAR ENGINES (PHASE 3) ---');
  await test('GET /api/trips/:tripId/itinerary (Day-wise Timeline with Activities & Totals)', async () => {
    const res = await request(`/api/trips/${tripId}/itinerary`, { token: tokenUser });
    assert(res.status === 200);
    assert(res.data.data.days.length >= 2);
    assert(res.data.data.days[0].activities.length >= 1);
  });

  await test('GET /api/trips/:tripId/budget (Budget Engine: Category & Daily Breakdown)', async () => {
    const res = await request(`/api/trips/${tripId}/budget`, { token: tokenUser });
    assert(res.status === 200);
    assert(res.data.data.totalBudget === 3500);
    assert(Array.isArray(res.data.data.categoryBreakdown));
    assert(Array.isArray(res.data.data.dailySpending));
  });

  await test('GET /api/trips/:tripId/calendar (Calendar Event Intervals)', async () => {
    const res = await request(`/api/trips/${tripId}/calendar`, { token: tokenUser });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length >= 1);
  });

  console.log('\n--- 6. PUBLIC SHARING & COPY TRIP (PHASE 3) ---');
  await test('POST /api/trips/:tripId/share (Generate Share Token)', async () => {
    const res = await request(`/api/trips/${tripId}/share`, {
      method: 'POST',
      token: tokenUser,
    });
    assert(res.status === 200);
    assert(res.data.data?.shareToken);
    shareToken = res.data.data.shareToken;
  });

  await test('GET /api/public/trips/:shareToken (Public View WITHOUT Auth)', async () => {
    const res = await request(`/api/public/trips/${shareToken}`);
    assert(res.status === 200);
    assert(res.data.data?.name === 'Grand Mediterranean Tour 2026');
    assert(Array.isArray(res.data.data?.days));
  });

  await test('POST /api/public/trips/:shareToken/copy (Copy Public Trip to Another User Account)', async () => {
    const res = await request(`/api/public/trips/${shareToken}/copy`, {
      method: 'POST',
      token: tokenOther,
    });
    assert(res.status === 201);
    assert(res.data.data?.id);
    copiedTripId = res.data.data.id;
  });

  await test('Verify Copied Trip has independent stops in other user account', async () => {
    const res = await request(`/api/trips/${copiedTripId}/stops`, { token: tokenOther });
    assert(res.status === 200);
    assert(res.data.data.length === 2);
  });

  console.log('\n--- 7. COMMUNITY & SAVED DESTINATIONS (PHASE 3) ---');
  await test('GET /api/trips?public=true (Community Trips List)', async () => {
    const res = await request('/api/trips?public=true', { token: tokenUser });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length >= 1);
  });

  await test('POST /api/users/me/saved-destinations (Save Destination)', async () => {
    const res = await request('/api/users/me/saved-destinations', {
      method: 'POST',
      token: tokenUser,
      body: { cityId },
    });
    assert(res.status === 200);
  });

  await test('GET /api/users/me/saved-destinations (List Saved Destinations)', async () => {
    const res = await request('/api/users/me/saved-destinations', { token: tokenUser });
    assert(res.status === 200);
    assert(res.data.data.some(c => c.id === cityId));
  });

  console.log('\n--- 8. ADMIN PANEL & ROLE SECURITY (PHASE 4) ---');
  await test('GET /api/admin/analytics (Admin Access with ADMIN Role)', async () => {
    const res = await request('/api/admin/analytics', { token: tokenAdmin });
    assert(res.status === 200);
    assert(res.data.data?.totalUsers >= 1);
    assert(Array.isArray(res.data.data?.userGrowth));
    assert(Array.isArray(res.data.data?.tripsByRegion));
  });

  await test('GET /api/admin/users (Admin Users List)', async () => {
    const res = await request('/api/admin/users', { token: tokenAdmin });
    assert(res.status === 200);
    assert(Array.isArray(res.data.data) && res.data.data.length >= 1);
  });

  await test('Security: Regular User cannot access Admin Panel (403 Forbidden)', async () => {
    const res = await request('/api/admin/analytics', { token: tokenUser });
    assert(res.status === 403);
  });

  console.log(`\n=============================================================`);
  console.log(`🏁 FULL E2E SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=============================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
