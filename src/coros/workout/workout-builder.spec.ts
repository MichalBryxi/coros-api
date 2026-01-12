import { describe, expect, it } from 'vitest';
import { WorkoutBuilder } from './workout-builder';
import { ExerciseType, IntensityType, TargetType } from './workout-types';

describe('WorkoutBuilder', () => {
  it('should create a simple distance-based workout', () => {
    const workout = new WorkoutBuilder('5km Run', 1)
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 500000, // 5km in cm
      })
      .build();

    expect(workout.name).toBe('5km Run');
    expect(workout.sportType).toBe(1);
    expect(workout.exercises).toHaveLength(1);
    expect(workout.exercises[0].exerciseType).toBe(ExerciseType.Training);
    expect(workout.exercises[0].targetValue).toBe(500000);
    expect(workout.distance).toBe('5000.00'); // 5km in meters
  });

  it('should create a workout with warm-up and cool-down', () => {
    const workout = new WorkoutBuilder('Easy Run', 1)
      .addWarmUp({
        targetType: TargetType.Distance,
        targetValue: 100000, // 1km
      })
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 300000, // 3km
      })
      .addCoolDown({
        targetType: TargetType.Distance,
        targetValue: 100000, // 1km
      })
      .build();

    expect(workout.exercises).toHaveLength(3);
    expect(workout.exercises[0].exerciseType).toBe(ExerciseType.WarmUp);
    expect(workout.exercises[1].exerciseType).toBe(ExerciseType.Training);
    expect(workout.exercises[2].exerciseType).toBe(ExerciseType.CoolDown);
    expect(workout.distance).toBe('5000.00'); // Total 5km
  });

  it('should create a time-based workout', () => {
    const workout = new WorkoutBuilder('30 Min Run', 1)
      .addTraining({
        targetType: TargetType.Time,
        targetValue: 1800, // 30 minutes in seconds
      })
      .build();

    expect(workout.duration).toBe(1800);
    expect(workout.exercises[0].targetType).toBe(TargetType.Time);
  });

  it('should create an interval workout with groups', () => {
    const workout = new WorkoutBuilder('Intervals', 1)
      .addWarmUp({
        targetType: TargetType.Distance,
        targetValue: 100000, // 1km
      })
      .addGroup({
        sets: 5,
        restValue: 30,
      })
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 40000, // 400m
        groupId: 2, // Reference to group
      })
      .addRest({
        duration: 90,
        groupId: 2,
      })
      .addCoolDown({
        targetType: TargetType.Distance,
        targetValue: 100000, // 1km
      })
      .build();

    expect(workout.exercises).toHaveLength(5);
    expect(workout.exercises[1].isGroup).toBe(true);
    expect(workout.exercises[1].sets).toBe(5);
    expect(workout.exercises[2].groupId).toBe('2');
    expect(workout.exercises[3].groupId).toBe('2');
  });

  it('should set intensity values correctly', () => {
    const workout = new WorkoutBuilder('Tempo Run', 1)
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 500000,
        intensityType: IntensityType.HeartRate,
        intensityPercent: 80000,
        intensityPercentExtend: 90000,
      })
      .build();

    const exercise = workout.exercises[0];
    expect(exercise.intensityType).toBe(IntensityType.HeartRate);
    expect(exercise.intensityPercent).toBe(80000);
    expect(exercise.intensityPercentExtend).toBe(90000);
    expect(exercise.isIntensityPercent).toBe(true);
  });

  it('should calculate total sets correctly', () => {
    const workout = new WorkoutBuilder('Intervals', 1)
      .addWarmUp({
        targetType: TargetType.Distance,
        targetValue: 100000,
      })
      .addGroup({
        sets: 8,
      })
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 40000,
        groupId: 2,
      })
      .addCoolDown({
        targetType: TargetType.Distance,
        targetValue: 100000,
      })
      .build();

    // 1 warm-up + 8 group sets + 1 cool-down = 10 total sets
    expect(workout.totalSets).toBe(10);
  });

  it('should assign sequential IDs to exercises', () => {
    const workout = new WorkoutBuilder('Test', 1)
      .addWarmUp({
        targetType: TargetType.Distance,
        targetValue: 100000,
      })
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 300000,
      })
      .addCoolDown({
        targetType: TargetType.Distance,
        targetValue: 100000,
      })
      .build();

    expect(workout.exercises[0].id).toBe(1);
    expect(workout.exercises[1].id).toBe(2);
    expect(workout.exercises[2].id).toBe(3);
  });

  it('should set correct pbVersion based on groups', () => {
    const simpleWorkout = new WorkoutBuilder('Simple', 1)
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 500000,
      })
      .build();

    const intervalWorkout = new WorkoutBuilder('Intervals', 1)
      .addGroup({ sets: 5 })
      .addTraining({
        targetType: TargetType.Distance,
        targetValue: 40000,
        groupId: 1,
      })
      .build();

    expect(simpleWorkout.pbVersion).toBe(2); // No groups
    expect(intervalWorkout.pbVersion).toBe(5); // Has groups
  });
});
