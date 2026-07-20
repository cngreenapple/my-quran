import http from 'node:http';
import { URL } from 'node:url';
import handler from './api/quran.js';

const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const query = Object.fromEntries(requestUrl.searchParams.entries());
  const request = {
    method: req.method,
    url: requestUrl.pathname,
    query,
    headers: req.headers,
  };

  const response = {
    statusCode: 200,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      res.writeHead(this.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload));
      return this;
    },
    send(payload) {
      res.writeHead(this.statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(payload);
      return this;
    },
  };

  const reqWithBody = req;
  reqWithBody.query = query;

  try {
    await handler(reqWithBody, response);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
