import { pgTable, text, serial, integer, timestamp, decimal, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Models table - for lithography simulation models
export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 5 }).notNull(),
  priceInWei: text("price_in_wei").notNull(),
  authorId: integer("author_id").references(() => users.id),
  authorAddress: text("author_address"),
  category: text("category").notNull(),
  features: json("features").$type<string[]>().default([]),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0"),
  numReviews: integer("num_reviews").default(0),
  contractAddress: text("contract_address"),
  tokenId: integer("token_id"),
  metadataUri: text("metadata_uri"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  imageUrl: text("image_url")
});

// User-model licenses
export const modelLicenses = pgTable("model_licenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  modelId: integer("model_id").references(() => models.id),
  walletAddress: text("wallet_address"),
  transactionHash: text("transaction_hash").notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull()
});

// Jobs table - for lithography simulation jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").notNull().unique(), // Custom job identifier (e.g., JOB-1234)
  userId: integer("user_id").references(() => users.id),
  modelId: integer("model_id").references(() => models.id).notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("queued"),
  progress: integer("progress").default(0),
  parameters: json("parameters").$type<Record<string, any>>().notNull(),
  maskFileUrl: text("mask_file_url"),
  cost: decimal("cost", { precision: 10, scale: 5 }).notNull(),
  transactionHash: text("transaction_hash"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  resultId: text("result_id"),
  resultFileUrl: text("result_file_url"),
  resultImageUrl: text("result_image_url")
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // job_payment, model_purchase, deposit
  amount: decimal("amount", { precision: 10, scale: 5 }).notNull(),
  amountInWei: text("amount_in_wei").notNull(),
  txHash: text("tx_hash").notNull(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  jobId: integer("job_id").references(() => jobs.id),
  modelId: integer("model_id").references(() => models.id),
  status: text("status").notNull().default("confirmed"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Documentation
export const documentation = pgTable("documentation", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  jobs: many(jobs),
  modelLicenses: many(modelLicenses),
  transactions: many(transactions),
  authoredModels: many(models, { relationName: "author" })
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  author: one(users, {
    fields: [models.authorId],
    references: [users.id],
    relationName: "author"
  }),
  jobs: many(jobs),
  licenses: many(modelLicenses)
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id]
  }),
  model: one(models, {
    fields: [jobs.modelId],
    references: [models.id]
  }),
  transactions: many(transactions)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  job: one(jobs, {
    fields: [transactions.jobId],
    references: [jobs.id]
  }),
  model: one(models, {
    fields: [transactions.modelId],
    references: [models.id]
  })
}));

export const modelLicensesRelations = relations(modelLicenses, ({ one }) => ({
  user: one(users, {
    fields: [modelLicenses.userId],
    references: [users.id]
  }),
  model: one(models, {
    fields: [modelLicenses.modelId],
    references: [models.id]
  })
}));

// Create zod schemas
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export type InsertUser = z.infer<typeof userInsertSchema>;

export const modelInsertSchema = createInsertSchema(models);
export const modelSelectSchema = createSelectSchema(models);
export type Model = z.infer<typeof modelSelectSchema>;
export type InsertModel = z.infer<typeof modelInsertSchema>;

export const jobInsertSchema = createInsertSchema(jobs);
export const jobSelectSchema = createSelectSchema(jobs);
export type Job = z.infer<typeof jobSelectSchema>;
export type InsertJob = z.infer<typeof jobInsertSchema>;

export const transactionInsertSchema = createInsertSchema(transactions);
export const transactionSelectSchema = createSelectSchema(transactions);
export type Transaction = z.infer<typeof transactionSelectSchema>;
export type InsertTransaction = z.infer<typeof transactionInsertSchema>;

export const modelLicenseInsertSchema = createInsertSchema(modelLicenses);
export const modelLicenseSelectSchema = createSelectSchema(modelLicenses);
export type ModelLicense = z.infer<typeof modelLicenseSelectSchema>;
export type InsertModelLicense = z.infer<typeof modelLicenseInsertSchema>;

export const documentationInsertSchema = createInsertSchema(documentation);
export const documentationSelectSchema = createSelectSchema(documentation);
export type Documentation = z.infer<typeof documentationSelectSchema>;
export type InsertDocumentation = z.infer<typeof documentationInsertSchema>;

// Custom schemas for API validations
export const jobSubmissionSchema = z.object({
  name: z.string().min(3, "Job name must be at least 3 characters"),
  modelId: z.string().min(1, "Please select a model"),
  resolution: z.coerce.number().positive("Resolution must be positive"),
  wavelength: z.coerce.number().positive("Wavelength must be positive"),
  numericalAperture: z.coerce.number().min(0, "Numerical aperture must be at least 0").max(1, "Numerical aperture must be at most 1"),
  iterations: z.coerce.number().int().positive("Iterations must be a positive integer"),
});

export type JobSubmission = z.infer<typeof jobSubmissionSchema>;
