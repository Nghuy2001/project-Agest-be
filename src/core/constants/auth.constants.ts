export const AUTH_COOKIE = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

export const TOKEN_EXPIRATION = {
  ACCESS: 15 * 60 * 1000,
  REFRESH: 30 * 24 * 60 * 60 * 1000,
};

export const ENV = {
  FE_URL: process.env.FE_URL || (() => { throw new Error('FE_URL not defined'); })(),
  JWT_SECRET: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET not defined'); })(),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error('GOOGLE_CLIENT_ID not defined'); })(),
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || (() => { throw new Error('GOOGLE_CALLBACK_URL not defined'); })(),
};
