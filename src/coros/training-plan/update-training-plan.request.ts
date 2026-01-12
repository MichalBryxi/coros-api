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
 * Input for updating a training plan
 * Uses the full QueryTrainingPlan structure which includes all required fields
 */
export const UpdateTrainingPlanInput = QueryTrainingPlan;
export type UpdateTrainingPlanInput = z.infer<typeof UpdateTrainingPlanInput>;

/**
 * Response data from updating a training plan
 * The API may return undefined, a string (plan ID), or an object
 */
export const UpdateTrainingPlanData = z
  .union([
    z.string(), // Plan ID as string
    z.object({
      planId: z.string().optional(),
      message: z.string().optional(),
    }),
    z.undefined(), // API returns undefined on successful update
  ])
  .optional();
export type UpdateTrainingPlanData = z.infer<typeof UpdateTrainingPlanData>;

export const UpdateTrainingPlanResponse = CorosResponse(UpdateTrainingPlanData);
export type UpdateTrainingPlanResponse = z.infer<typeof UpdateTrainingPlanResponse>;

@Injectable()
export class UpdateTrainingPlanRequest extends BaseRequest<
  UpdateTrainingPlanInput,
  UpdateTrainingPlanResponse,
  { planId?: string; message?: string }
> {
  private readonly logger = new Logger(UpdateTrainingPlanRequest.name);
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

  protected inputValidator(): z.Schema<UpdateTrainingPlanInput> {
    return UpdateTrainingPlanInput;
  }

  protected responseValidator(): z.Schema<UpdateTrainingPlanResponse> {
    return UpdateTrainingPlanResponse;
  }

  protected async handle(plan: UpdateTrainingPlanInput): Promise<{ planId?: string; message?: string }> {
    const url = new URL('/training/plan/update', this.corosConfig.apiUrl);

    // Log the entire payload for debugging
    this.logger.log('=== UPDATE TRAINING PLAN PAYLOAD ===');
    this.logger.log(JSON.stringify(plan, null, 2));
    this.logger.log('=== END PAYLOAD ===');

    const { data } = await this.httpService.axiosRef.post(url.toString(), plan, {
      headers: {
        accesstoken: this.corosAuthenticationService.accessToken,
      },
    });

    this.logger.log('=== UPDATE RESPONSE ===');
    this.logger.log(JSON.stringify(data, null, 2));
    this.logger.log('=== END RESPONSE ===');

    this.assertCorosResponseBase(data);
    this.assertCorosResponse(data);

    // Normalize response - API returns either a string (plan ID) or an object
    const responseData = data.data;
    if (typeof responseData === 'string') {
      return { planId: responseData };
    }
    return responseData || {};
  }
}
