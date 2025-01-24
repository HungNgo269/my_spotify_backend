// src/server.ts

import express, { Request, Response, NextFunction, RequestHandler } from 'express'
import axios from 'axios'
import qs from 'qs'
import config from './config'

const app = express()

// ------------------------------------
// Các biến môi trường (ENV)
function makeid(length: number): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
const asyncHandler: (fn: RequestHandler) => RequestHandler =
  (fn) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
const CLIENT_ID = config.client_id
const CLIENT_SECRET = config.client_secret
const PORT = config.port
const REDIRECT_URL = config.redirect_url

// ------------------------------------

// Trang chủ cho đơn giản, hoặc có thể bỏ
app.get('/', (req: Request, res: Response) => {
  res.send('Server Spotify OAuth Demo')
})

// ROUTE: /login - chuyển hướng người dùng sang Spotify để login
app.get('/login', (req: Request, res: Response) => {
  const scope = 'user-read-private user-read-email' // scope cần thiết
  const state = makeid(16) // hoặc random, dùng để chống CSRF

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    qs.stringify({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URL,
      scope: scope,
      state: state
    })

  // Chuyển hướng user đến trang Spotify Login
  res.redirect(authUrl)
})

app.get(
  '/callback',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code as string | null
    const error = req.query.error as string | null

    if (error) {
      res.send(`Xảy ra lỗi đăng nhập: ${error}`)
      return
    }

    if (!code) {
      res.send('Không có mã code được trả về từ Spotify.')
      return
    }

    try {
      // (1) Exchange code for token
      const tokenUrl = 'https://accounts.spotify.com/api/token'
      const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

      const response = await axios.post(
        tokenUrl,
        qs.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URL
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + authHeader
          }
        }
      )

      // (2) Destructure the tokens
      const { access_token, refresh_token, expires_in, token_type } = response.data

      // (3) Redirect back to your client, passing tokens in query (or store them securely!)
      const redirectToClient = `http://localhost:3000/?access_token=${access_token}&refresh_token=${refresh_token}`
      res.redirect(redirectToClient)
      return
    } catch (err) {
      console.error(err)
      res.send('Lỗi khi trao đổi "code" lấy "access_token".')
      return
    }
  })
)

// Middleware xử lý lỗi
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
