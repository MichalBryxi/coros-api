import { URL } from 'node:url';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { BaseRequest } from '../base-request';
import { CorosResponse } from '../common';
import { CorosConfigService } from '../coros.config';
import { CorosAuthenticationService } from '../coros-authentication.service';
import { ExerciseBarChart, Workout, WorkoutExercise } from '../workout/workout-types';

/**
 * Input for querying training plans
 */
export const QueryTrainingPlansInput = z.object({
  name: z.string().default(''),
  statusList: z.array(z.number()).default([0]), // 0 = active plans
  startNo: z.number().default(0),
  limitSize: z.number().default(10),
});
export type QueryTrainingPlansInput = z.infer<typeof QueryTrainingPlansInput>;

/**
 * Training plan entity from query response
 */
const QueryTrainingPlanEntity = z.object({
  dayNo: z.number(),
  executeStatus: z.number(),
  id: z.string(),
  idInPlan: z.string(),
  planId: z.string(),
  planIdIndex: z.number(),
  planProgramId: z.string(),
  score: z.string(),
  sortNo: z.number(),
  sortNoInSchedule: z.number(),
  standardRate: z.string(),
  thirdParty: z.boolean(),
  exerciseBarChart: z.array(ExerciseBarChart).optional(),
  operateUserId: z.string().optional(),
  happenDay: z.string().optional(),
});

/**
 * Exercise with coerced ID to handle both string and number from API
 */
const QueryWorkoutExercise = WorkoutExercise.extend({
  id: z.coerce.number(), // Detail endpoint returns string, but we need number
  status: z.number().optional(),
  videoInfos: z.array(z.unknown()).optional(),
});

/**
 * Training plan program from query response
 * This extends Workout but uses string for idInPlan (as returned by the API)
 * Note: The detail endpoint returns some fields differently than the query endpoint
 */
const QueryTrainingPlanProgram = Workout.extend({
  idInPlan: z.string(), // API returns this as string
  distance: z.coerce.string(), // Detail endpoint returns number, query returns string
  exercises: z.array(QueryWorkoutExercise), // Override to use coerced exercise IDs
  planId: z.string().optional(),
  planIdIndex: z.number().optional(),
  cardType: z.string().optional(),
  dataType: z.string().optional(),
  distanceDisplayUnit: z.number().optional(),
  sets: z.number().optional(), // May be undefined in detail response
  deleted: z.number().optional(),
  elevGain: z.number().optional(),
  estimatedDistance: z.number().optional(),
  estimatedTime: z.number().optional(),
  isTargetTypeConsistent: z.number().optional(),
});

/**
 * Training plan from query response
 */
export const QueryTrainingPlan = z.object({
  id: z.string(),
  name: z.string(),
  overview: z.string(),
  access: z.number(),
  authorId: z.string(),
  category: z.number(),
  createTime: z.string(),
  updateTime: z.string(),
  updateTimestamp: z.number(),
  starTimestamp: z.number(),
  executeStatus: z.number(),
  inSchedule: z.number(),
  maxIdInPlan: z.union([z.string(), z.number()]), // Can be either string or number
  maxPlanProgramId: z.string(),
  maxWeeks: z.number(),
  minWeeks: z.number(),
  pbVersion: z.number(),
  planIcon: z.number(),
  region: z.number(),
  sourceId: z.string(),
  sourceUrl: z.string(),
  status: z.number(),
  thirdPartyId: z.number(),
  totalDay: z.number(),
  unit: z.number(),
  userId: z.string(),
  version: z.number(),
  entities: z.array(QueryTrainingPlanEntity),
  programs: z.array(QueryTrainingPlanProgram).optional().default([]),
  competitions: z.array(z.unknown()).default([]),
  eventTags: z.array(z.unknown()).default([]),
  likeTpIds: z.array(z.unknown()).default([]),
  sportDatasInPlan: z.array(z.unknown()).default([]),
  sportDatasNotInPlan: z.array(z.unknown()).default([]),
  userInfos: z.array(z.unknown()).default([]),
  versionObjects: z.array(z.unknown()).default([]),
  weekStages: z.array(z.unknown()).default([]),
  // Optional fields that may be present
  headPic: z.string().optional(),
  nickname: z.string().optional(),
  sex: z.number().optional(),
  operateUserId: z.string().optional(),
  officalConfig: z.unknown().optional(),
});
export type QueryTrainingPlan = z.infer<typeof QueryTrainingPlan>;

/**
 * Response data from querying training plans
 * The API returns an array directly in the data field, or undefined if no plans exist
 */
export const QueryTrainingPlansData = z.array(QueryTrainingPlan).optional();
export type QueryTrainingPlansData = z.infer<typeof QueryTrainingPlansData>;

export const QueryTrainingPlansResponse = CorosResponse(QueryTrainingPlansData);
export type QueryTrainingPlansResponse = z.infer<typeof QueryTrainingPlansResponse>;

@Injectable()
export class QueryTrainingPlansRequest extends BaseRequest<
  QueryTrainingPlansInput,
  QueryTrainingPlansResponse,
  QueryTrainingPlan[]
> {
  private readonly logger = new Logger(QueryTrainingPlansRequest.name);
  private readonly httpService: HttpService;
  private readonly corosConfig: CorosConfigService;
  private readonly corosAuthenticationService: CorosAuthenticationService;

  constructor(
    httpService: HttpService,
    corosConfig: CorosConfigService,
    corosAuthenticationService: CorosAuthenticationService,
  ) {
    super();
    this.corosAuthenticationService = corosAuthenticationService;
    this.corosConfig = corosConfig;
    this.httpService = httpService;
  }

  protected inputValidator(): z.Schema<QueryTrainingPlansInput> {
    return QueryTrainingPlansInput;
  }

  protected responseValidator(): z.Schema<QueryTrainingPlansResponse> {
    return QueryTrainingPlansResponse;
  }

  protected async handle(input: QueryTrainingPlansInput): Promise<QueryTrainingPlan[]> {
    const url = new URL('/training/plan/query', this.corosConfig.apiUrl);

    const { data } = await this.httpService.axiosRef.post(url.toString(), input, {
      headers: {
        accesstoken: this.corosAuthenticationService.accessToken,
      },
    });

    this.logger.log('=== QUERY RESPONSE ===');
    this.logger.log(JSON.stringify(data, null, 2));
    this.logger.log('=== END QUERY RESPONSE ===');

    this.logger.verbose('Query training plans request response', data);

    this.assertCorosResponseBase(data);
    this.assertCorosResponse(data);

    // Return empty array if no plans exist
    return data.data || [];
  }
}
