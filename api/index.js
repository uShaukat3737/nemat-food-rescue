// Single Vercel serverless function handling every /api/* request.
// vercel.json rewrites /api/(.*) here, because Vercel's filesystem routing
// alone only matches one path segment under api/. This just
// delegates straight to the same router used by server.js locally, so
// there's exactly one implementation of the API, not two.
const { handleApiRequest } = require('../lib/api');

module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  await handleApiRequest(req, res, url);
};
