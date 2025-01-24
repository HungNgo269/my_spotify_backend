// src/config.ts

import dotenv from 'dotenv'
dotenv.config()

// interface DBConfig {
//   host: string;
//   user: string;
//   password: string;
// }

interface Config {
  client_id: string
  client_secret: string
  port: number
  redirect_url: string
  //   db: DBConfig;
  //   jwtSecret: string;
}

const config: Config = {
  client_id: process.env.CLIENT_ID || '',
  client_secret: process.env.CLIENT_SECRET || '',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  redirect_url: process.env.REDIRECT_URL || `http://localhost:5000/callback`
  //   db: {
  //     host: process.env.DB_HOST || 'localhost',
  //     user: process.env.DB_USER || 'root',
  //     password: process.env.DB_PASSWORD || '',
  //   },
  //   jwtSecret: process.env.JWT_SECRET || 'defaultsecret',
}

// Kiểm tra sự tồn tại của các biến môi trường quan trọng
const requiredEnv = [
  'CLIENT_ID',
  'CLIENT_SECRET'
  //   'DB_HOST',
  //   'DB_USER',
  //   'DB_PASSWORD',
  //   'JWT_SECRET',
]

requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
})

export default config
