/* global require, process */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const { getJwtSecret, MIN_SECRET_BYTES, signToken, verifyToken } = require('../config/jwt');
const authController = require('../controllers/authController');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const makeSecret = () => crypto.randomBytes(MIN_SECRET_BYTES).toString('hex');

test('JWT configuration rejects a missing secret', () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    assert.throws(() => getJwtSecret(), /JWT_SECRET/);
  } finally {
    if (originalSecret !== undefined) process.env.JWT_SECRET = originalSecret;
  }
});

test('JWT configuration rejects a secret shorter than the documented minimum', () => {
  assert.throws(() => getJwtSecret('too-short'), /at least 32 bytes/);
});

test('JWT tokens use the configured secret and HS256 consistently', () => {
  const originalSecret = process.env.JWT_SECRET;
  const secret = makeSecret();
  process.env.JWT_SECRET = secret;

  try {
    const token = signToken({ id: 'user-123' });
    assert.equal(verifyToken(token).id, 'user-123');

    process.env.JWT_SECRET = makeSecret();
    assert.throws(() => verifyToken(token));
  } finally {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});

test('auth middleware returns a generic 401 for missing and invalid bearer tokens', async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = makeSecret();
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  const invoke = async (authorization) => {
    const req = { headers: authorization ? { authorization } : {} };
    const res = {
      statusCode: null,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
    };
    await protect(req, res, () => assert.fail('next must not run for invalid credentials'));
    return res;
  };

  const missing = await invoke(undefined);
  const invalid = await invoke('Bearer invalid.token.value');
  assert.equal(missing.statusCode, 401);
  assert.equal(invalid.statusCode, 401);
  assert.equal(invalid.body.message, 'Not authorized — invalid token');
  assert.doesNotMatch(JSON.stringify(invalid.body), /secret|stack|jsonwebtoken/i);
});

test('signup ignores a client-supplied privileged role', async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const secret = makeSecret();
  process.env.JWT_SECRET = secret;
  let createdUser;

  User.findOne = async () => null;
  User.create = async (user) => {
    createdUser = user;
    return { _id: 'user-123' };
  };

  t.after(() => {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await authController.signup({
    body: { name: 'Test User', email: 'test@example.com', password: 'not-a-real-password', role: 'admin' },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdUser.role, 'citizen');
  assert.equal(verifyToken(res.body.token).id, 'user-123');
});
