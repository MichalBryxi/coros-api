/**
 * Example workout builders for common workout types
 *
 * This file demonstrates how to use the WorkoutBuilder to create various types of workouts
 * that can be sent to the Coros API.
 */

import { WorkoutBuilder } from './workout-builder';
import { IntensityType, TargetType } from './workout-types';

/**
 * Create a simple 5km easy run workout
 *
 * Example usage:
 * ```typescript
 * const workout = create5kmEasyRun();
 * await corosAPI.createWorkout(workout);
 * ```
 */
export function create5kmEasyRun() {
  return new WorkoutBuilder('5km Easy Run', 1) // sportType 1 = running
    .addTraining({
      targetType: TargetType.Distance,
      targetValue: 500000, // 5km in centimeters (5000m * 100)
      name: 'Easy Run',
      intensityType: IntensityType.HeartRate,
      intensityPercent: 59550, // ~60% reserve HR
      intensityPercentExtend: 67760, // ~68% reserve HR
    })
    .build();
}

/**
 * Create an interval workout: 8x400m with 90s rest
 *
 * This creates:
 * - 1.5km warm-up
 * - 8 repetitions of:
 *   - 400m at pace
 *   - 90s rest
 * - 1.5km cool-down
 */
export function createRolling400s() {
  const builder = new WorkoutBuilder('Rolling 400s', 1);

  // Warm-up: 1.5km
  builder.addWarmUp({
    targetType: TargetType.Distance,
    targetValue: 150000, // 1.5km in centimeters
    name: 'Warm Up',
  });

  // Create a group for 8 repetitions with 30s rest between sets
  builder.addGroup({
    sets: 8,
    restValue: 30, // 30 seconds rest between each set
  });

  // 400m work interval (part of the group)
  builder.addTraining({
    targetType: TargetType.Distance,
    targetValue: 40000, // 400m in centimeters
    name: 'Work',
    intensityType: IntensityType.Pace,
    intensityValue: 215000, // Pace in milliseconds (3:35/km = 215 seconds * 1000)
    intensityValueExtend: 225000, // Upper pace limit (3:45/km = 225 seconds * 1000)
    groupId: 2, // Reference to the group (ID 2)
  });

  // Rest interval (part of the group)
  builder.addRest({
    duration: 90, // 90 seconds
    name: 'Rest',
    groupId: 2, // Reference to the group (ID 2)
  });

  // Cool-down: 1.5km
  builder.addCoolDown({
    targetType: TargetType.Distance,
    targetValue: 150000, // 1.5km in centimeters
    name: 'Cool Down',
  });

  return builder.build();
}

/**
 * Create a tempo run workout
 *
 * This creates:
 * - 10 min warm-up
 * - 20 min tempo at threshold pace
 * - 10 min cool-down
 */
export function createTempoRun() {
  return new WorkoutBuilder('Tempo Run', 1)
    .addWarmUp({
      targetType: TargetType.Time,
      targetValue: 600, // 10 minutes in seconds
      name: 'Warm Up',
    })
    .addTraining({
      targetType: TargetType.Time,
      targetValue: 1200, // 20 minutes in seconds
      name: 'Tempo',
      intensityType: IntensityType.HeartRate,
      intensityPercent: 80000, // ~80% reserve HR
      intensityPercentExtend: 90000, // ~90% reserve HR
    })
    .addCoolDown({
      targetType: TargetType.Time,
      targetValue: 600, // 10 minutes in seconds
      name: 'Cool Down',
    })
    .build();
}

/**
 * Create a pyramid interval workout
 *
 * This creates:
 * - 1km warm-up
 * - 200m, 400m, 800m, 400m, 200m with 90s rest between each
 * - 1km cool-down
 */
export function createPyramidIntervals() {
  const builder = new WorkoutBuilder('Pyramid Intervals', 1);

  builder.addWarmUp({
    targetType: TargetType.Distance,
    targetValue: 100000, // 1km
    name: 'Warm Up',
  });

  const intervals = [20000, 40000, 80000, 40000, 20000]; // 200m, 400m, 800m, 400m, 200m

  intervals.forEach((distance, index) => {
    builder.addTraining({
      targetType: TargetType.Distance,
      targetValue: distance,
      name: `Interval ${index + 1}`,
      intensityType: IntensityType.Pace,
      intensityValue: 180000, // 3:00/km pace (180 seconds * 1000)
      intensityValueExtend: 210000, // 3:30/km pace (210 seconds * 1000)
    });

    // Add rest after each interval except the last one
    if (index < intervals.length - 1) {
      builder.addRest({
        duration: 90,
        name: 'Recovery',
      });
    }
  });

  builder.addCoolDown({
    targetType: TargetType.Distance,
    targetValue: 100000, // 1km
    name: 'Cool Down',
  });

  return builder.build();
}
