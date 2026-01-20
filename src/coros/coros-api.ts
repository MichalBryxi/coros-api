import { Injectable } from '@nestjs/common';
import { LoginRequest } from './account/login.request';
import { DownloadActivityDetailRequest } from './activity/download-activity-detail.request';
import { QueryActivitiesRequest } from './activity/query-activities.request';
import { getSportTypeValueFromKey, isValidSportTypeKey } from './sport-type';
import { CreateTrainingPlanRequest } from './training-plan/create-training-plan.request';
import { DeleteTrainingPlanRequest } from './training-plan/delete-training-plan.request';
import { GetTrainingPlanDetailRequest } from './training-plan/get-training-plan-detail.request';
import type { QueryTrainingPlan } from './training-plan/query-training-plans.request';
import { QueryTrainingPlansRequest } from './training-plan/query-training-plans.request';
import type { TrainingPlan } from './training-plan/training-plan-types';
import { UpdateTrainingPlanRequest } from './training-plan/update-training-plan.request';
import { QueryTrainingScheduleRequest } from './training-schedule/query-training-schedule.request';
import { CreateWorkoutRequest } from './workout/create-workout.request';
import type { Workout } from './workout/workout-types';

@Injectable()
export class CorosAPI {
  private readonly loginCommand: LoginRequest;
  private readonly queryActivitiesCommand: QueryActivitiesRequest;
  private readonly downloadActivityDetailCommand: DownloadActivityDetailRequest;
  private readonly createWorkoutCommand: CreateWorkoutRequest;
  private readonly createTrainingPlanCommand: CreateTrainingPlanRequest;
  private readonly deleteTrainingPlanCommand: DeleteTrainingPlanRequest;
  private readonly getTrainingPlanDetailCommand: GetTrainingPlanDetailRequest;
  private readonly queryTrainingPlansCommand: QueryTrainingPlansRequest;
  private readonly updateTrainingPlanCommand: UpdateTrainingPlanRequest;
  private readonly queryTrainingScheduleCommand: QueryTrainingScheduleRequest;

  constructor(
    loginCommand: LoginRequest,
    queryActivitiesCommand: QueryActivitiesRequest,
    downloadActivityDetailCommand: DownloadActivityDetailRequest,
    createWorkoutCommand: CreateWorkoutRequest,
    createTrainingPlanCommand: CreateTrainingPlanRequest,
    deleteTrainingPlanCommand: DeleteTrainingPlanRequest,
    getTrainingPlanDetailCommand: GetTrainingPlanDetailRequest,
    queryTrainingPlansCommand: QueryTrainingPlansRequest,
    updateTrainingPlanCommand: UpdateTrainingPlanRequest,
    queryTrainingScheduleCommand: QueryTrainingScheduleRequest,
  ) {
    this.downloadActivityDetailCommand = downloadActivityDetailCommand;
    this.queryActivitiesCommand = queryActivitiesCommand;
    this.loginCommand = loginCommand;
    this.createWorkoutCommand = createWorkoutCommand;
    this.createTrainingPlanCommand = createTrainingPlanCommand;
    this.deleteTrainingPlanCommand = deleteTrainingPlanCommand;
    this.getTrainingPlanDetailCommand = getTrainingPlanDetailCommand;
    this.queryTrainingPlansCommand = queryTrainingPlansCommand;
    this.updateTrainingPlanCommand = updateTrainingPlanCommand;
    this.queryTrainingScheduleCommand = queryTrainingScheduleCommand;
  }

  async login() {
    return await this.loginCommand.run({});
  }

  async queryActivities({
    from,
    to,
    page,
    size,
    sportTypes,
  }: {
    from?: Date;
    to?: Date;
    size?: number;
    page?: number;
    sportTypes: string[] | string;
  }) {
    // Handle both array and string input
    // If it's a string, it might be a sport type key that needs conversion
    let modeList: string;
    if (Array.isArray(sportTypes)) {
      modeList = sportTypes.join(',');
    } else {
      // If it's a valid sport type key, convert it to value
      if (isValidSportTypeKey(sportTypes)) {
        modeList = getSportTypeValueFromKey(sportTypes);
      } else {
        // Otherwise assume it's already a value
        modeList = sportTypes;
      }
    }

    return await this.queryActivitiesCommand.run({
      from,
      to,
      pageSize: size,
      pageNumber: page,
      modeList,
    });
  }

  async downloadActivityDetail({
    sportType,
    fileType,
    labelId,
  }: {
    sportType: number;
    fileType: string;
    labelId: string;
  }) {
    return await this.downloadActivityDetailCommand.run({ sportType, fileType, labelId });
  }

  async createWorkout(workout: Workout) {
    return await this.createWorkoutCommand.run(workout);
  }

  async createTrainingPlan(plan: TrainingPlan) {
    return await this.createTrainingPlanCommand.run(plan);
  }

  async queryTrainingPlans(input?: { name?: string; statusList?: number[]; startNo?: number; limitSize?: number }) {
    return await this.queryTrainingPlansCommand.run({
      name: input?.name ?? '',
      statusList: input?.statusList ?? [0],
      startNo: input?.startNo ?? 0,
      limitSize: input?.limitSize ?? 10,
    });
  }

  async queryTrainingSchedule({
    startDate,
    endDate,
    supportRestExercise = 1,
  }: {
    startDate: Date;
    endDate: Date;
    supportRestExercise?: number;
  }) {
    return await this.queryTrainingScheduleCommand.run({
      startDate,
      endDate,
      supportRestExercise,
    });
  }

  async getTrainingPlanDetail(planId: string, region = 3) {
    return await this.getTrainingPlanDetailCommand.run({
      id: planId,
      region,
      supportRestExercise: 1,
    });
  }

  async deleteTrainingPlan(planId: string) {
    return await this.deleteTrainingPlanCommand.run([planId]);
  }

  async deleteTrainingPlans(planIds: string[]) {
    return await this.deleteTrainingPlanCommand.run(planIds);
  }

  async updateTrainingPlan(existingPlan: QueryTrainingPlan, newPlanData: TrainingPlan) {
    console.log('=== DEBUG: Existing plan programs ===');
    existingPlan.programs?.forEach((p) => {
      console.log(`  idInPlan: ${p.idInPlan} (type: ${typeof p.idInPlan}), id: ${p.id}, name: ${p.name}`);
    });
    console.log('=== DEBUG: New plan programs ===');
    newPlanData.programs.forEach((p) => {
      console.log(`  idInPlan: ${p.idInPlan} (type: ${typeof p.idInPlan}), id: ${p.id}, name: ${p.name}`);
    });

    // Merge the existing plan with new data, converting types as needed
    const updatedPlan: QueryTrainingPlan = {
      ...existingPlan,
      // Update with new plan data
      name: newPlanData.name,
      overview: newPlanData.overview,
      entities: newPlanData.entities.map((e, idx) => {
        // Find the corresponding program to generate exerciseBarChart
        const program = newPlanData.programs.find((p) => p.idInPlan === e.idInPlan);
        const existingEntity = existingPlan.entities[idx];
        const exerciseBarChart = program?.exerciseBarChart || existingEntity?.exerciseBarChart;

        return {
          dayNo: e.dayNo,
          executeStatus: existingEntity?.executeStatus || 0,
          id: existingEntity?.id || '',
          idInPlan: String(e.idInPlan),
          planId: existingPlan.id,
          planIdIndex: existingEntity?.planIdIndex || 0,
          planProgramId: String(e.idInPlan),
          score: existingEntity?.score || '0',
          sortNo: e.sortNo,
          sortNoInSchedule: e.sortNoInSchedule,
          standardRate: existingEntity?.standardRate || '0',
          thirdParty: existingEntity?.thirdParty || false,
          exerciseBarChart,
          operateUserId: existingPlan.operateUserId,
          happenDay: existingEntity?.happenDay || '',
        };
      }),
      programs: newPlanData.programs.map((p) => {
        // Find existing program by idInPlan to preserve server-generated fields
        // Note: existingPlan has idInPlan as string, newPlanData has it as number
        const existingProgram = existingPlan.programs?.find((ep) => ep.idInPlan === String(p.idInPlan));

        if (existingProgram) {
          // Update existing program - preserve all existing fields and only update what changed
          return {
            ...existingProgram,
            // Update only the fields that can change from the CSV
            name: p.name,
            overview: p.overview,
            exercises: p.exercises,
            exerciseBarChart: p.exerciseBarChart,
            // Keep idInPlan as string
            idInPlan: String(p.idInPlan),
          };
        }
        // New program - use the new data with required fields
        return {
          ...p,
          idInPlan: String(p.idInPlan),
          planId: existingPlan.id,
          planIdIndex: 0,
          authorId: existingPlan.authorId,
          userId: existingPlan.userId,
          headPic: existingPlan.headPic || '',
          nickname: existingPlan.nickname || '',
          sex: existingPlan.sex || 0,
        };
      }),
      weekStages: existingPlan.weekStages || [], // Keep existing weekStages
      versionObjects:
        existingPlan.versionObjects && existingPlan.versionObjects.length > 0
          ? existingPlan.versionObjects
          : // Generate versionObjects if not present
            newPlanData.programs.map((p) => ({
              id: String(p.idInPlan),
              planProgramId: String(p.idInPlan),
              planId: existingPlan.id,
              status: 2,
              onlyId: crypto.randomUUID(),
              type: 0,
            })),
      maxIdInPlan: newPlanData.maxIdInPlan, // Keep as number
      maxPlanProgramId: String(newPlanData.maxIdInPlan),
      totalDay: newPlanData.totalDay,
      unit: newPlanData.unit,
      sourceId: newPlanData.sourceId,
      sourceUrl: newPlanData.sourceUrl,
      minWeeks: newPlanData.minWeeks,
      maxWeeks: newPlanData.maxWeeks,
      region: newPlanData.region,
      pbVersion: newPlanData.pbVersion,
      // Keep the existing version - the server will handle incrementing it
      version: existingPlan.version,
    };
    return await this.updateTrainingPlanCommand.run(updatedPlan);
  }
}
