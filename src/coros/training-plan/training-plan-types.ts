import { z } from 'zod';
import { Workout } from '../workout/workout-types';

/**
 * Training plan entity - represents a workout scheduled on a specific day
 */
export const TrainingPlanEntity = z.object({
  happenDay: z.string().default(''),
  idInPlan: z.number(),
  sortNo: z.number().default(0),
  dayNo: z.number(), // Day number in the plan (0-based)
  sortNoInPlan: z.number().default(0),
  sortNoInSchedule: z.number().default(0),
});
export type TrainingPlanEntity = z.infer<typeof TrainingPlanEntity>;

/**
 * Training plan program - extends Workout with additional plan-specific fields
 */
export const TrainingPlanProgram = Workout.extend({
  idInPlan: z.number(),
  cardType: z.string().optional().default('program'),
  dataType: z.string().optional().default('program'),
  distanceDisplayUnit: z.number().optional().default(1),
});
export type TrainingPlanProgram = z.infer<typeof TrainingPlanProgram>;

/**
 * Week stage in a training plan
 */
export const WeekStage = z.object({
  // Add fields as needed based on API requirements
});
export type WeekStage = z.infer<typeof WeekStage>;

/**
 * Version object for tracking plan changes
 */
export const VersionObject = z.object({
  id: z.number(),
  status: z.number().default(1),
});
export type VersionObject = z.infer<typeof VersionObject>;

/**
 * Complete training plan structure
 */
export const TrainingPlan = z.object({
  name: z.string(),
  overview: z.string().default(''),
  entities: z.array(TrainingPlanEntity),
  programs: z.array(TrainingPlanProgram),
  weekStages: z.array(WeekStage).default([]),
  maxIdInPlan: z.number(),
  totalDay: z.number(),
  unit: z.number().default(0),
  sourceId: z.string(),
  sourceUrl: z.string(),
  minWeeks: z.number(),
  maxWeeks: z.number(),
  region: z.number().default(3),
  pbVersion: z.number().default(2),
  versionObjects: z.array(VersionObject),
});
export type TrainingPlan = z.infer<typeof TrainingPlan>;
