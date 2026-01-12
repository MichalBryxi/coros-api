import { URL } from 'node:url';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { BaseRequest } from '../base-request';
import { CorosResponse } from '../common';
import { CorosConfigService } from '../coros.config';
import { CorosAuthenticationService } from '../coros-authentication.service';
import { QueryTrainingPlan } from './query-training-plans.request';

/**
 * Input for getting training plan details
 */
export const GetTrainingPlanDetailInput = z.object({
  id: z.string(),
  region: z.number().default(3),
  supportRestExercise: z.number().default(1),
});
export type GetTrainingPlanDetailInput = z.infer<typeof GetTrainingPlanDetailInput>;

/**
 * Response data from getting training plan details
 */
export const GetTrainingPlanDetailData = QueryTrainingPlan;
export type GetTrainingPlanDetailData = z.infer<typeof GetTrainingPlanDetailData>;

export const GetTrainingPlanDetailResponse = CorosResponse(GetTrainingPlanDetailData);
export type GetTrainingPlanDetailResponse = z.infer<typeof GetTrainingPlanDetailResponse>;

@Injectable()
export class GetTrainingPlanDetailRequest extends BaseRequest<
  GetTrainingPlanDetailInput,
  GetTrainingPlanDetailResponse,
  QueryTrainingPlan
> {
  private readonly logger = new Logger(GetTrainingPlanDetailRequest.name);
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

  protected inputValidator(): z.Schema<GetTrainingPlanDetailInput> {
    return GetTrainingPlanDetailInput;
  }

  protected responseValidator(): z.Schema<GetTrainingPlanDetailResponse> {
    return GetTrainingPlanDetailResponse;
  }

  protected async handle(input: GetTrainingPlanDetailInput): Promise<QueryTrainingPlan> {
    const url = new URL('/training/plan/detail', this.corosConfig.apiUrl);
    url.searchParams.append('id', input.id);
    url.searchParams.append('region', String(input.region));
    url.searchParams.append('supportRestExercise', String(input.supportRestExercise));

    const { data } = await this.httpService.axiosRef.get(url.toString(), {
      headers: {
        accesstoken: this.corosAuthenticationService.accessToken,
      },
    });

    this.logger.log('=== GET PLAN DETAIL RESPONSE ===');
    this.logger.log(JSON.stringify(data, null, 2));
    this.logger.log('=== END DETAIL RESPONSE ===');

    this.logger.verbose('Get training plan detail response', data);

    this.assertCorosResponseBase(data);
    this.assertCorosResponse(data);

    return data.data;
  }
}
