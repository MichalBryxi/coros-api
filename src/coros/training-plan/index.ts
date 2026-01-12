/**
 * Coros Training Plan API
 *
 * This module provides types and utilities for creating training plans via the Coros API.
 */

// Request handlers
export { type CreateTrainingPlanData, CreateTrainingPlanRequest } from './create-training-plan.request';
export { type DeleteTrainingPlanData, DeleteTrainingPlanRequest } from './delete-training-plan.request';
export {
  type GetTrainingPlanDetailData,
  GetTrainingPlanDetailRequest,
} from './get-training-plan-detail.request';
export {
  type QueryTrainingPlan,
  type QueryTrainingPlansData,
  QueryTrainingPlansRequest,
} from './query-training-plans.request';
// Types
export type {
  TrainingPlan,
  TrainingPlanEntity,
  TrainingPlanProgram,
  VersionObject,
  WeekStage,
} from './training-plan-types';
export { type UpdateTrainingPlanData, UpdateTrainingPlanRequest } from './update-training-plan.request';
