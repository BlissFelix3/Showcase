import { DataSource, DataSourceOptions } from 'typeorm';
import config from '.';
import * as dotenv from 'dotenv';
dotenv.config();

const connection: {
  host?: string;
  username?: string;
  password?: string;
  database?: string;
  port?: number;
  url?: string;
} = {};

if (process.env.NODE_ENV === 'dev') {
  connection.host = process.env.DB_HOST;
  connection.username = process.env.DB_USER;
  connection.password = process.env.DB_PASSWORD;
  connection.database = process.env.DB_NAME;
  connection.port = Number(process.env.DB_PORT);
} else {
  connection.url = config.db.url;
}

const dbType =
  (process.env.DB_TYPE as 'mysql' | 'postgres' | 'sqlite' | undefined) ??
  'mysql';

const baseOptions = {
  migrations: ['dist/db/migrations/*.js'],
  ssl: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  subscribers: [],
  logging: process.env.NODE_ENV === 'dev' ? ['query', 'error'] : false,
  synchronize: process.env.NODE_ENV === 'dev',
  dropSchema: false,
};

export const typeOrmConfig: DataSourceOptions = {
  type: dbType as DataSourceOptions['type'],
  ...(dbType === 'sqlite'
    ? { database: process.env.DB_PATH || 'data/dev.sqlite' }
    : {
        ...connection,
        charset: 'utf8mb4',
        timezone: '+00:00',
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
        },
      }),
  ...baseOptions,
} as DataSourceOptions;

export const dataSource = new DataSource(typeOrmConfig);
