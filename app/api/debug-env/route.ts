export async function GET() {
  return Response.json({
    status: "Environment Check",
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    hasEmailFrom: !!process.env.EMAIL_FROM,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    // Security: only show lengths, not actual values
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    authSecretLength: process.env.AUTH_SECRET?.length || 0,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
  });
} 