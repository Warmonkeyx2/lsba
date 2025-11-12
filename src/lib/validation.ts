import { z } from 'zod';

// Common validation schemas
export const boxerSchema = z.object({
  id: z.string().min(1),
  stateId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().min(10),
  sponsor: z.string().optional(),
  profileImage: z.string().optional(),
  timezone: z.string().min(1),
  feePaid: z.boolean().default(false),
  lastPaymentDate: z.string().nullable().optional(),
  licenseStatus: z.enum(['active', 'suspended', 'expired']).default('active'),
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  knockouts: z.number().int().min(0).default(0),
  rankingPoints: z.number().min(0).default(0),
  licenseFee: z.number().min(0).default(25),
  fightHistory: z.array(z.object({
    id: z.string(),
    opponent: z.string(),
    date: z.string(),
    result: z.enum(['win', 'loss', 'knockout', 'pending']),
    eventName: z.string(),
    fightCardId: z.string().optional(),
    pointsChange: z.number().optional(),
  })).default([]),
  suspensionReason: z.string().nullable().optional(),
  suspensionDate: z.string().nullable().optional(),
  registeredDate: z.string().nullable().optional(),
});

export const sponsorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logoUrl: z.string().optional(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  boxersSponsored: z.array(z.string()).default([]),
  sponsorshipLevel: z.enum(['bronze', 'silver', 'gold', 'platinum']).default('bronze'),
  isActive: z.boolean().default(true),
});

export const fightCardSchema = z.object({
  id: z.string().optional(),
  eventDate: z.string().min(1),
  location: z.string().min(1),
  mainEvent: z.object({
    id: z.string(),
    fighter1: z.string(),
    fighter2: z.string(),
    fighter1Id: z.string().optional(),
    fighter2Id: z.string().optional(),
    type: z.enum(['main', 'co-main', 'other']),
    winner: z.enum(['fighter1', 'fighter2']).optional(),
    knockout: z.boolean().optional(),
    title: z.string().optional(),
  }),
  coMainEvent: z.object({
    id: z.string(),
    fighter1: z.string(),
    fighter2: z.string(),
    fighter1Id: z.string().optional(),
    fighter2Id: z.string().optional(),
    type: z.enum(['main', 'co-main', 'other']),
    winner: z.enum(['fighter1', 'fighter2']).optional(),
    knockout: z.boolean().optional(),
    title: z.string().optional(),
  }).optional(),
  otherBouts: z.array(z.object({
    id: z.string(),
    fighter1: z.string(),
    fighter2: z.string(),
    fighter1Id: z.string().optional(),
    fighter2Id: z.string().optional(),
    type: z.enum(['main', 'co-main', 'other']),
    winner: z.enum(['fighter1', 'fighter2']).optional(),
    knockout: z.boolean().optional(),
    title: z.string().optional(),
  })).default([]),
  sponsors: z.string().optional(),
  status: z.enum(['upcoming', 'live', 'completed']).default('upcoming'),
  createdDate: z.string().optional(),
});

export const bettingConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  eventPricing: z.object({
    regular: z.number().min(0),
    special: z.number().min(0),
    tournament: z.number().min(0),
  }),
  wageLimits: z.object({
    minimum: z.number().min(0),
    maximum: z.number().min(0),
    perFight: z.number().min(0),
    perEvent: z.number().min(0),
  }),
  lastUpdated: z.string(),
});

// Validation helper functions
export const validateBoxer = (data: unknown) => {
  try {
    return { success: true as const, data: boxerSchema.parse(data) };
  } catch (error) {
    return { success: false as const, error: error as z.ZodError };
  }
};

export const validateSponsor = (data: unknown) => {
  try {
    return { success: true as const, data: sponsorSchema.parse(data) };
  } catch (error) {
    return { success: false as const, error: error as z.ZodError };
  }
};

export const validateFightCard = (data: unknown) => {
  try {
    return { success: true as const, data: fightCardSchema.parse(data) };
  } catch (error) {
    return { success: false as const, error: error as z.ZodError };
  }
};

export const validateBettingConfig = (data: unknown) => {
  try {
    return { success: true as const, data: bettingConfigSchema.parse(data) };
  } catch (error) {
    return { success: false as const, error: error as z.ZodError };
  }
};

// Environment validation
export const envSchema = z.object({
  VITE_COSMOSDB_ENDPOINT: z.string().url(),
  VITE_COSMOSDB_KEY: z.string().min(1),
  VITE_COSMOSDB_DATABASE_ID: z.string().min(1),
  VITE_APP_NAME: z.string().optional(),
  VITE_APP_VERSION: z.string().optional(),
  VITE_NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export const validateEnv = () => {
  try {
    return { 
      success: true as const, 
      data: envSchema.parse(import.meta.env) 
    };
  } catch (error) {
    return { 
      success: false as const, 
      error: error as z.ZodError 
    };
  }
};

// Error formatting
export const formatValidationErrors = (error: z.ZodError): string => {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
};