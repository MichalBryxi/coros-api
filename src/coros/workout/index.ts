/**
 * Coros Workout API
 *
 * This module provides types and utilities for creating workouts via the Coros API.
 */

// Request handler
export { type CreateWorkoutData, CreateWorkoutRequest } from './create-workout.request';

// Builder
export { WorkoutBuilder } from './workout-builder';
// Examples
export {
  create5kmEasyRun,
  createPyramidIntervals,
  createRolling400s,
  createTempoRun,
} from './workout-examples';
// Types
export {
  type ExerciseBarChart,
  ExerciseType,
  HrType,
  IntensityType,
  type ReferExercise,
  RestType,
  TargetType,
  type Workout,
  type WorkoutExercise,
} from './workout-types';
