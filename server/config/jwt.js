/* global require, process, Buffer, module */
const jwt = require('jsonwebtoken');

const MIN_SECRET_BYTES = 32;

const getJwtSecret = (secret = process.env.JWT_SECRET) => {
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < MIN_SECRET_BYTES) {
    throw new Error(
      `JWT_SECRET must contain at least ${MIN_SECRET_BYTES} bytes of cryptographically random data.`,
    );
  }

  return secret;
};

const signToken = (payload) => jwt.sign(payload, getJwtSecret(), {
  algorithm: 'HS256',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const verifyToken = (token) => jwt.verify(token, getJwtSecret(), {
  algorithms: ['HS256'],
});

module.exports = { MIN_SECRET_BYTES, getJwtSecret, signToken, verifyToken };
