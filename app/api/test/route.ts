export async function GET() {
  return Response.json({
    status: "Server is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
} 