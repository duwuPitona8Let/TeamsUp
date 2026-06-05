export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret:
      process.env.JWT_SECRET || 'teams-up-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  database: {
    path: process.env.DB_PATH || 'teams-up.sqlite',
  },
});
