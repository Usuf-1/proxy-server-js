const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
app.use(cors());

// Example usage: /proxy?url=https://stream-url.m3u8&referer=https://aniwatch.to/&userAgent=Mozilla/5.0
app.get('/proxy', (req, res) => {
  const { url, referer, userAgent } = req.query;
  if (!url) return res.status(400).send('Missing url');

  request({
    url,
    headers: {
      'Referer': referer || 'https://megacloud.blog',
      'User-Agent': userAgent || 'Mozilla/5.0',
    },
  })
    .on('error', (err) => res.status(500).send('Proxy error: ' + err.message))
    .pipe(res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`)); 