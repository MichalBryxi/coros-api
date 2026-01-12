import { readFileSync } from 'node:fs';
import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import type { TrainingPlan, TrainingPlanEntity, TrainingPlanProgram } from '../coros/training-plan/training-plan-types';
import { WorkoutBuilder } from '../coros/workout/workout-builder';
import { ExerciseType, IntensityType, TargetType, type Workout } from '../coros/workout/workout-types';

/**
 * CSV row schema for training plan with workout definitions
 *
 * CSV Format:
 * plan_name,week,day,workout_name,description,exercise_type,target_type,target_value,intensity_type,intensity_min,intensity_max,sets,rest_seconds,name
 *
 * Example:
 * 8-Week 5K Plan,1,1,Week 1 - Intervals,Interval training session,warmup,distance,1500,hrr,60,68,,,Warm Up
 * 8-Week 5K Plan,1,1,Week 1 - Intervals,,group,,,,,,8,90,
 * 8-Week 5K Plan,1,1,Week 1 - Intervals,,training,distance,400,pace,5:50,5:50,,,400m Sprint
 */
const TrainingPlanCsvRow = z.object({
  plan_name: z.string(),
  week: z.string(),
  day: z.string(),
  workout_name: z.string(),
  description: z.string().optional().default(''),
  exercise_type: z.enum(['warmup', 'training', 'cooldown', 'rest', 'group']),
  target_type: z.enum(['distance', 'time', '']).optional(),
  target_value: z.string().optional(),
  intensity_type: z.enum(['hr', 'hrr', 'pace', '']).optional(),
  intensity_min: z.string().optional(),
  intensity_max: z.string().optional(),
  sets: z.string().optional(),
  rest_seconds: z.string().optional(),
  name: z.string().optional(),
});
type TrainingPlanCsvRow = z.infer<typeof TrainingPlanCsvRow>;

@Injectable()
export class TrainingPlanCsvParserService {
  private readonly logger = new Logger(TrainingPlanCsvParserService.name);

  /**
   * Parse training plan CSV file with embedded workout definitions
   * @param filePath Path to the training plan CSV
   */
  parseFile(filePath: string): TrainingPlan {
    this.logger.log(`Parsing training plan from: ${filePath}`);

    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as unknown[];

    // Validate all rows
    const rows = records.map((record, index) => {
      const result = TrainingPlanCsvRow.safeParse(record);
      if (!result.success) {
        throw new Error(`Invalid CSV row at line ${index + 2}: ${result.error.message}`);
      }
      return result.data;
    });

    if (rows.length === 0) {
      throw new Error('Training plan CSV is empty');
    }

    const planName = rows[0].plan_name;

    // Group rows by week, day, and workout_name to build workouts
    type WorkoutKey = { week: number; day: number; workoutName: string; description: string };
    const workoutGroups = new Map<string, { key: WorkoutKey; rows: TrainingPlanCsvRow[] }>();

    for (const row of rows) {
      const week = Number.parseInt(row.week);
      const day = Number.parseInt(row.day);
      const workoutKey = `${week}-${day}-${row.workout_name}`;

      const existing = workoutGroups.get(workoutKey);
      if (existing) {
        existing.rows.push(row);
      } else {
        workoutGroups.set(workoutKey, {
          key: { week, day, workoutName: row.workout_name, description: row.description || '' },
          rows: [row],
        });
      }
    }

    // Build workouts and schedule
    const entities: TrainingPlanEntity[] = [];
    const programs: TrainingPlanProgram[] = [];
    const versionObjects: { id: number; status: number }[] = [];
    let maxIdInPlan = 0;
    let maxDayNo = 0;

    for (const { key, rows: workoutRows } of workoutGroups.values()) {
      const workout = this.buildWorkout(key.workoutName, key.description, workoutRows);
      const idInPlan = ++maxIdInPlan;
      const dayNo = this.calculateDayNumber(key.week, key.day);
      maxDayNo = Math.max(maxDayNo, dayNo);

      // Add entity (schedule entry)
      entities.push({
        happenDay: '',
        idInPlan,
        sortNo: 0,
        dayNo,
        sortNoInPlan: 0,
        sortNoInSchedule: 0,
      });

      // Add program (workout)
      programs.push({
        ...workout,
        idInPlan,
        cardType: 'program',
        dataType: 'program',
        distanceDisplayUnit: 1,
      });

      // Add version object
      versionObjects.push({
        id: idInPlan,
        status: 1,
      });
    }

    const totalDays = maxDayNo + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    const plan: TrainingPlan = {
      name: planName,
      overview: '',
      entities,
      programs,
      weekStages: [],
      maxIdInPlan,
      totalDay: totalDays,
      unit: 0,
      sourceId: programs[programs.length - 1].sourceId,
      sourceUrl: programs[programs.length - 1].sourceUrl,
      minWeeks: totalWeeks,
      maxWeeks: totalWeeks,
      region: 3,
      pbVersion: 2,
      versionObjects,
    };

    this.logger.log(`Built training plan: ${planName} (${totalWeeks} weeks, ${programs.length} workouts)`);
    return plan;
  }

  /**
   * Build a single workout from CSV rows
   */
  private buildWorkout(name: string, description: string, rows: TrainingPlanCsvRow[]): Workout {
    const builder = new WorkoutBuilder(name, 1); // Default to running (sportType 1)
    builder.setOverview(description); // Set the workout description
    let exerciseIdCounter = 1;
    let currentGroupId: number | undefined;

    for (const row of rows) {
      const exerciseType = this.parseExerciseType(row.exercise_type);

      if (exerciseType === ExerciseType.Group) {
        // Group exercise - defines a repeated set
        currentGroupId = exerciseIdCounter; // The group will get this ID
        const sets = Number.parseInt(row.sets || '1');
        const restValue = Number.parseInt(row.rest_seconds || '0');
        builder.addGroup({ sets, restValue });
        exerciseIdCounter++;
        continue;
      }

      // Parse target
      const targetType = this.parseTargetType(row.target_type);
      const targetValue = this.parseTargetValue(row.target_type, row.target_value);

      // Parse intensity
      const intensityType = this.parseIntensityType(row.intensity_type);
      const intensityValues = this.parseIntensityValues(row.intensity_type, row.intensity_min, row.intensity_max);

      const exerciseName = row.name || this.getDefaultExerciseName(exerciseType);

      // Add exercise based on type
      if (exerciseType === ExerciseType.WarmUp) {
        builder.addWarmUp({
          targetType,
          targetValue,
          name: exerciseName,
          intensityType,
          ...intensityValues,
        });
        exerciseIdCounter++;
      } else if (exerciseType === ExerciseType.Training) {
        builder.addTraining({
          targetType,
          targetValue,
          name: exerciseName,
          intensityType,
          groupId: currentGroupId,
          ...intensityValues,
        });
        exerciseIdCounter++;
      } else if (exerciseType === ExerciseType.CoolDown) {
        builder.addCoolDown({
          targetType,
          targetValue,
          name: exerciseName,
          intensityType,
          ...intensityValues,
        });
        exerciseIdCounter++;
      } else if (exerciseType === ExerciseType.Rest) {
        const duration = targetType === TargetType.Time ? targetValue : 0;
        builder.addRest({
          duration,
          name: exerciseName,
          groupId: currentGroupId,
        });
        exerciseIdCounter++;
      }
    }

    return builder.build();
  }

  /**
   * Calculate day number from week and day
   * Week 1, Day 1 = Day 0
   * Week 1, Day 2 = Day 1
   * Week 2, Day 1 = Day 7
   */
  private calculateDayNumber(week: number, day: number): number {
    return (week - 1) * 7 + (day - 1);
  }

  /**
   * Parse exercise type from CSV
   */
  private parseExerciseType(exerciseType: string): ExerciseType {
    switch (exerciseType) {
      case 'warmup':
        return ExerciseType.WarmUp;
      case 'training':
        return ExerciseType.Training;
      case 'cooldown':
        return ExerciseType.CoolDown;
      case 'rest':
        return ExerciseType.Rest;
      case 'group':
        return ExerciseType.Group;
      default:
        throw new Error(`Unknown exercise type: ${exerciseType}`);
    }
  }

  /**
   * Parse target type from CSV
   */
  private parseTargetType(targetType?: string): TargetType {
    if (targetType === 'distance') return TargetType.Distance;
    if (targetType === 'time') return TargetType.Time;
    return TargetType.Time; // Default to time
  }

  /**
   * Parse target value from CSV
   * - For distance: convert meters to centimeters (5000 -> 500000)
   * - For time: convert seconds or MM:SS to seconds (120 or 2:00 -> 120)
   */
  private parseTargetValue(targetType?: string, value?: string): number {
    if (!value) return 0;

    if (targetType === 'distance') {
      // Distance in meters, convert to centimeters
      return Number.parseFloat(value) * 100;
    }

    if (targetType === 'time') {
      // Time can be in seconds (e.g., "120") or MM:SS format (e.g., "2:00")
      if (value.includes(':')) {
        const [minutes, seconds] = value.split(':').map(Number);
        return minutes * 60 + seconds;
      }
      return Number.parseFloat(value);
    }

    return 0;
  }

  /**
   * Parse intensity type from CSV
   */
  private parseIntensityType(intensityType?: string): IntensityType {
    if (intensityType === 'hr' || intensityType === 'hrr') {
      return IntensityType.HeartRate;
    }
    if (intensityType === 'pace') return IntensityType.Pace;
    return IntensityType.None;
  }

  /**
   * Parse intensity values from CSV
   * - For hr: absolute heart rate in bpm (137 -> 137)
   * - For hrr: percentage of heart rate reserve (60 -> 60000 basis points)
   * - For pace: convert MM:SS/km to milliseconds (5:00 -> 300000)
   */
  private parseIntensityValues(
    intensityType?: string,
    min?: string,
    max?: string,
  ): {
    intensityValue?: number;
    intensityValueExtend?: number;
    intensityPercent?: number;
    intensityPercentExtend?: number;
  } {
    if (!intensityType || !min) {
      return {};
    }

    if (intensityType === 'hr') {
      // Absolute heart rate in bpm (e.g., "137" -> 137 bpm)
      const minHr = Number.parseFloat(min);
      const maxHr = max ? Number.parseFloat(max) : minHr;
      return {
        intensityValue: minHr,
        intensityValueExtend: maxHr,
      };
    }

    if (intensityType === 'hrr') {
      // Percentage of heart rate reserve (e.g., "60" -> 60000 basis points)
      const minPercent = Number.parseFloat(min) * 1000;
      const maxPercent = max ? Number.parseFloat(max) * 1000 : minPercent;
      return {
        intensityPercent: minPercent,
        intensityPercentExtend: maxPercent,
      };
    }

    if (intensityType === 'pace') {
      // Pace in MM:SS format (e.g., "5:00" -> 300000 milliseconds)
      const minPace = this.parsePaceToMilliseconds(min);
      const maxPace = max ? this.parsePaceToMilliseconds(max) : minPace;
      return {
        intensityValue: minPace,
        intensityValueExtend: maxPace,
      };
    }

    return {};
  }

  /**
   * Parse pace from MM:SS format to milliseconds
   */
  private parsePaceToMilliseconds(pace: string): number {
    const [minutes, seconds] = pace.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  }

  /**
   * Get default exercise name based on type
   */
  private getDefaultExerciseName(exerciseType: ExerciseType): string {
    switch (exerciseType) {
      case ExerciseType.WarmUp:
        return 'Warm Up';
      case ExerciseType.Training:
        return 'Training';
      case ExerciseType.CoolDown:
        return 'Cool Down';
      case ExerciseType.Rest:
        return 'Rest';
      default:
        return 'Exercise';
    }
  }
}
