// data-source.ts (project root; compiles to dist/data-source.js)
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/src/**/*.entity.js'], // <-- dist/src/
  migrations: ['dist/src/migrations/*.js'], // <-- dist/src/migrations
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  logging: true,
});
