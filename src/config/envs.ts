import 'dotenv/config';
import * as joi from 'joi';

/**
 * @interface EnvVars
 * @description Defines the structure of expected environment variables.
 */
interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  NATS_SERVERS: string[];
}

// Define the validation schema using Joi
const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true); // Allow other environment variables

// Validate environment variables
const { error, value } = envsSchema.validate({
  ...process.env,
  // Split NATS_SERVERS string into an array
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`!!! Config validation error: ${error.message} !!!`);
}

// Cast validated value to the EnvVars interface
const envVars: EnvVars = value;

/**
 * @const {object} envs
 * @description Exported configuration object.
 */
export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
};
