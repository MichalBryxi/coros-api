import { z } from 'zod';

/**
 * Exercise types in a workout
 * 0 = Group (container for repeated exercises)
 * 1 = Warm up
 * 2 = Training/Work
 * 3 = Cool down
 * 4 = Rest
 */
export enum ExerciseType {
  Group = 0,
  WarmUp = 1,
  Training = 2,
  CoolDown = 3,
  Rest = 4,
}

/**
 * Target types for exercises
 * 2 = Time (duration in seconds)
 * 5 = Distance (in centimeters)
 */
export enum TargetType {
  Time = 2,
  Distance = 5,
}

/**
 * Intensity types
 * 0 = None/Open
 * 2 = Heart Rate
 * 3 = Pace
 */
export enum IntensityType {
  None = 0,
  HeartRate = 2,
  Pace = 3,
}

/**
 * Heart Rate type
 * 0 = None
 * 2 = % of Reserve Heart Rate (%rhr)
 */
export enum HrType {
  None = 0,
  ReserveHeartRate = 2,
}

/**
 * Rest type
 * 3 = Time (in seconds)
 */
export enum RestType {
  Time = 3,
}

/**
 * Individual exercise within a workout
 */
export const WorkoutExercise = z.object({
  access: z.number().default(0),
  createTimestamp: z.number().optional(),
  defaultOrder: z.number(),
  equipment: z.array(z.number()).optional(),
  exerciseType: z.nativeEnum(ExerciseType),
  groupId: z.union([z.string(), z.number()]).default(''),
  hrType: z.nativeEnum(HrType).default(HrType.None),
  id: z.number(),
  intensityCustom: z.number().default(0),
  intensityDisplayUnit: z.union([z.string(), z.number()]).default(0),
  intensityMultiplier: z.number().default(0),
  intensityPercent: z.number().default(0),
  intensityPercentExtend: z.number().default(0),
  intensityType: z.nativeEnum(IntensityType).default(IntensityType.None),
  intensityValue: z.number().default(0),
  intensityValueExtend: z.number().default(0),
  isDefaultAdd: z.number().default(0),
  isGroup: z.boolean().default(false),
  isIntensityPercent: z.boolean().default(false),
  name: z.string(),
  originId: z.string().default(''),
  overview: z.string().default(''),
  part: z.array(z.number()).optional(),
  programId: z.string().optional(),
  restType: z.nativeEnum(RestType).default(RestType.Time),
  restValue: z.number().default(0),
  sets: z.number().default(1),
  sortNo: z.number(),
  sourceId: z.string().default('0'),
  sourceUrl: z.string().default(''),
  sportType: z.number().default(0),
  subType: z.number().default(0),
  targetDisplayUnit: z.union([z.string(), z.number()]).default(0),
  targetType: z.union([z.nativeEnum(TargetType), z.string()]).default(''),
  targetValue: z.number().default(0),
  userId: z.number().default(0),
  videoUrl: z.string().default(''),
});
export type WorkoutExercise = z.infer<typeof WorkoutExercise>;

/**
 * Exercise bar chart item for visualization
 */
export const ExerciseBarChart = z.object({
  exerciseId: z.string(),
  exerciseType: z.nativeEnum(ExerciseType),
  height: z.number(),
  name: z.string(),
  targetType: z.nativeEnum(TargetType),
  targetValue: z.number(),
  value: z.number(),
  width: z.number(),
  widthFill: z.number(),
});
export type ExerciseBarChart = z.infer<typeof ExerciseBarChart>;

/**
 * Reference exercise for intensity calculations
 */
export const ReferExercise = z.object({
  intensityType: z.number(),
  hrType: z.number(),
  valueType: z.number(),
});
export type ReferExercise = z.infer<typeof ReferExercise>;

/**
 * Complete workout/program structure
 */
export const Workout = z.object({
  access: z.number().default(1),
  authorId: z.string().default('0'),
  createTimestamp: z.number().default(0),
  distance: z.string(),
  duration: z.number(),
  essence: z.number().default(0),
  estimatedType: z.number().default(0),
  estimatedValue: z.number().default(0),
  exerciseNum: z.number().default(0),
  exercises: z.array(WorkoutExercise),
  exerciseBarChart: z.array(ExerciseBarChart).optional(),
  fastIntensityTypeName: z.string().optional(),
  headPic: z.string().default(''),
  id: z.string().default('0'),
  idInPlan: z.string().default('0'),
  name: z.string(),
  nickname: z.string().default(''),
  originEssence: z.number().default(0),
  overview: z.string().default(''),
  pbVersion: z.number(),
  pitch: z.number().default(0),
  planIdIndex: z.number().default(0),
  poolLength: z.number().default(2500),
  poolLengthId: z.number().default(1),
  poolLengthUnit: z.number().default(2),
  profile: z.string().default(''),
  referExercise: ReferExercise,
  sets: z.number(),
  sex: z.number().default(0),
  shareUrl: z.string().default(''),
  simple: z.boolean().default(false),
  sourceId: z.string(),
  sourceUrl: z.string(),
  sportType: z.number(),
  star: z.number().default(0),
  subType: z.number().default(65535),
  targetType: z.number().default(0),
  targetValue: z.number().default(0),
  thirdPartyId: z.number().default(0),
  totalSets: z.number(),
  trainingLoad: z.number(),
  type: z.number().default(0),
  unit: z.number().default(0),
  userId: z.string().default('0'),
  version: z.number().default(0),
  videoCoverUrl: z.string().default(''),
  videoUrl: z.string().default(''),
});
export type Workout = z.infer<typeof Workout>;
