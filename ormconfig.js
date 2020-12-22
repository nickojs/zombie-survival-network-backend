module.exports = {
  type: process.env.type,
  host: process.env.host,
  port: process.env.port,
  username: process.env.username,
  password: process.env.password,
  database: process.env.database,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  seeds: ['src/seed/**/*{.ts,.js}'],
  factories: ['src/factory/**/*{.ts,.js}'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber'
  }
};
