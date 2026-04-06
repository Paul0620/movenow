import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  height: numeric('height', { mode: 'number' }).notNull(),
  weight: numeric('weight', { mode: 'number' }).notNull(),
  age: integer('age').notNull(),
  gender: text('gender', { enum: ['male', 'female'] }).notNull(),
  goal: text('goal', { enum: ['loss', 'gain', 'maintain'] }).notNull(),
  activity_level: text('activity_level', {
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  }).notNull(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date', { mode: 'string' }).notNull(),
  exercise_name: text('exercise_name').notNull(),
  duration_minutes: integer('duration_minutes').notNull(),
  intensity: text('intensity', { enum: ['low', 'moderate', 'high'] }).notNull(),
  sets: integer('sets'),
  reps: integer('reps'),
  weight_kg: numeric('weight_kg', { mode: 'number' }),
  calories_burned: integer('calories_burned').notNull(),
  met_value: numeric('met_value', { mode: 'number' }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const dietLogs = pgTable('diet_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date', { mode: 'string' }).notNull(),
  meal_time: text('meal_time', {
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  }).notNull(),
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  protein_g: numeric('protein_g', { mode: 'number' }).notNull(),
  carbs_g: numeric('carbs_g', { mode: 'number' }).notNull(),
  fat_g: numeric('fat_g', { mode: 'number' }).notNull(),
  amount_g: numeric('amount_g', { mode: 'number' }),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
})
