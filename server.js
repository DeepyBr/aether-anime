const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory data store for community features (comments, ratings, quiz leaderboard, VIP users)
const db = {
  comments: {},
  ratings: {},
  vipUsers: new Set(),
};

// Seed initial lively anime comments
db.comments['default'] = [
  { id: '1', author: 'Renan_Uchiha', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Renan', text: 'Essa animação está em outro nível! Abertura lendária 🔥', timestamp: 'Há 12 min', likes: 14 },
  { id: '2', author: 'SakuraVibes', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sakura', text: 'O episódio 1 me pegou de surpresa, dublagem sensacional!', timestamp: 'Há 45 min', likes: 8 },
  { id: '3', author: 'KageLevel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kage', text: 'Melhor player de anime que já vi, sem travamentos e com visual cyberpunk neon!', timestamp: 'Há 2 horas', likes: 29 }
];

// Helper to query Otakulogia GraphQL
async function queryOtakulogia(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    const req = https.request('https://api.otakulogia.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://otakulogia.com',
        'Referer': 'https://otakulogia.com/',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout to Otakulogia API'));
    });

    req.write(postData);
    req.end();
  });
}

// 1. GraphQL Proxy endpoint
app.post('/api/graphql', async (req, res) => {
  const { query, variables } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await queryOtakulogia(query, variables);
    return res.json(result);
  } catch (err) {
    console.error('GraphQL Proxy Error:', err.message);
    return res.status(502).json({ error: 'Failed to contact Otakulogia API', details: err.message });
  }
});

// 2. High-performance Video Streaming Proxy with Range headers & CORS
app.get('/api/video-proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('URL query parameter required');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid URL');
  }

  const clientReq = parsedUrl.protocol === 'https:' ? https : http;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://otakulogia.com/',
  };

  if (req.headers.range) {
    headers['range'] = req.headers.range;
  }

  const proxyReq = clientReq.request(parsedUrl, {
    method: 'GET',
    headers: headers
  }, (proxyRes) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Accept-Ranges, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    if (proxyRes.headers['content-range']) {
      res.setHeader('Content-Range', proxyRes.headers['content-range']);
    }
    if (proxyRes.headers['content-length']) {
      res.setHeader('Content-Length', proxyRes.headers['content-length']);
    }
    if (proxyRes.headers['content-type']) {
      res.setHeader('Content-Type', proxyRes.headers['content-type']);
    }
    res.setHeader('Accept-Ranges', 'bytes');

    res.status(proxyRes.statusCode || 200);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Video proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).send('Error proxying video');
    }
  });

  req.on('close', () => {
    proxyReq.destroy();
  });

  proxyReq.end();
});

// 3. Comments API (get / post)
app.get('/api/comments/:episodeId', (req, res) => {
  const epId = req.params.episodeId;
  const list = db.comments[epId] || db.comments['default'] || [];
  res.json({ comments: list });
});

app.post('/api/comments/:episodeId', (req, res) => {
  const epId = req.params.episodeId;
  const { author, text, avatar } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const newComment = {
    id: Date.now().toString(),
    author: author || 'Otaku Anônimo',
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${author || Date.now()}`,
    text,
    timestamp: 'Agora mesmo',
    likes: 1
  };

  if (!db.comments[epId]) {
    db.comments[epId] = [...(db.comments['default'] || [])];
  }
  db.comments[epId].unshift(newComment);
  res.json({ comment: newComment, total: db.comments[epId].length });
});

// 4. Ratings API
app.get('/api/ratings/:cid', (req, res) => {
  const cid = req.params.cid;
  const data = db.ratings[cid] || { average: 4.9, count: 128 };
  res.json(data);
});

app.post('/api/ratings/:cid', (req, res) => {
  const cid = req.params.cid;
  const { stars } = req.body;
  const starNum = Number(stars) || 5;

  if (!db.ratings[cid]) {
    db.ratings[cid] = { totalStars: 4.9 * 128 + starNum, count: 129 };
  } else {
    db.ratings[cid].totalStars += starNum;
    db.ratings[cid].count += 1;
  }
  const average = Number((db.ratings[cid].totalStars / db.ratings[cid].count).toFixed(1));
  res.json({ average, count: db.ratings[cid].count });
});

// 5. VIP Simulation API
app.post('/api/vip/create-pix', (req, res) => {
  const { plan, email } = req.body;
  const prices = { monthly: '14,90', quarterly: '39,90', annual: '119,90' };
  const price = prices[plan] || '14,90';
  const qrCodeText = `00020126580014br.gov.bcb.pix0136otakulogia-aether-${Date.now()}5204000053039865405${price.replace(',', '.')}5802BR5916AETHER_OTAKU6009SAO_PAULO62070503***6304`;

  res.json({
    txId: 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    amount: price,
    plan,
    pixCode: qrCodeText,
    qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeText)}&color=00f0ff&bgcolor=0a081e`,
    expiresInSeconds: 600
  });
});

app.post('/api/vip/verify-pix', (req, res) => {
  const { txId } = req.body;
  db.vipUsers.add(txId);
  res.json({ status: 'APPROVED', isVip: true, vipUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Aether Anime Backend', otakulogiaProxy: true });
});

app.listen(PORT, () => {
  console.log(`[Aether-Server] Backend proxy running on http://localhost:${PORT}`);
});
