import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  AUTH_URL: z.string().url("AUTH_URL must be a valid URL").optional().default("http://localhost:3000"),
  CRON_SECRET: z.string().min(8, "CRON_SECRET must be at least 8 characters"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(
      `Environment variable validation failed:\n${errorDetails}\nPlease check your .env file or deployment settings.`
    );
  }

  return result.data;
};

export const env = parseEnv();
