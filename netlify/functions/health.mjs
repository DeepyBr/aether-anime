// Netlify Function: Health Check
export default async (req, context) => {
  return new Response(JSON.stringify({
    status: 'ok',
    platform: 'Netlify Serverless Functions',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const config = {
  path: "/api/health",
};
