import { URL } from 'node:url';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { BaseRequest } from '../base-request';
import { CorosResponse } from '../common';
import { CorosConfigService } from '../coros.config';
import { CorosAuthenticationService } from '../coros-authentication.service';
import { TrainingPlan } from './training-plan-types';

/**
 * Response data from creating a training plan
 * The API returns either a string (plan ID) or an object with planId/message
 */
export const CreateTrainingPlanData = z.union([
  z.string(), // Plan ID as string
  z.object({
    planId: z.string().optional(),
    message: z.string().optional(),
  }),
]);
export type CreateTrainingPlanData = z.infer<typeof CreateTrainingPlanData>;

export const CreateTrainingPlanResponse = CorosResponse(CreateTrainingPlanData);
export type CreateTrainingPlanResponse = z.infer<typeof CreateTrainingPlanResponse>;

/**
 * Input for creating a training plan
 */
const CreateTrainingPlanInput = TrainingPlan;
type CreateTrainingPlanInput = z.infer<typeof CreateTrainingPlanInput>;

@Injectable()
export class CreateTrainingPlanRequest extends BaseRequest<
  CreateTrainingPlanInput,
  CreateTrainingPlanResponse,
  { planId?: string; message?: string }
> {
  private readonly logger = new Logger(CreateTrainingPlanRequest.name);
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

  protected inputValidator(): z.Schema<CreateTrainingPlanInput> {
    return CreateTrainingPlanInput;
  }

  protected responseValidator(): z.Schema<CreateTrainingPlanResponse> {
    return CreateTrainingPlanResponse;
  }

  protected async handle(plan: CreateTrainingPlanInput): Promise<{ planId?: string; message?: string }> {
    const url = new URL('/training/plan/add', this.corosConfig.apiUrl);

    // Log the payload for debugging
    this.logger.debug('Training plan payload:', JSON.stringify(plan, null, 2));

    const { data } = await this.httpService.axiosRef.post(url.toString(), plan, {
      headers: {
        accesstoken: this.corosAuthenticationService.accessToken,
      },
    });

    this.logger.verbose('Create training plan request response', data);

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
