export const validateEnv = () => {
  const required = [
    "JWT_SECRET",
    "RESEND_API_KEY",
    "EMAIL_USER",
    "MONGO_URI",
    "FRONTEND_URL"
  ];

  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  console.log("Environment variables validated");
};