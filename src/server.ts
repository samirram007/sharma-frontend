import type { Request, Response } from 'express'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-ignore
import { render } from '../dist-ssr/entry-server.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// serve static assets from client build
app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }))

// template HTML from Vite build
const template = fs.readFileSync(
  path.resolve(__dirname, 'dist/index.html'),
  'utf-8',
)

app.get('*', async (req: Request, res: Response) => {
  try {
    const appHtml = await render(req.url)
    const html = template.replace(`<!--app-->`, appHtml)
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (err) {
    console.error(err)
    res.status(500).end('Internal Server Error')
  }
})

app.listen(5172, () => {
  console.log('SSR server running at http://localhost:5172')
})
