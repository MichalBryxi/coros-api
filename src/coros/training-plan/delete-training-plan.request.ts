import { URL } from 'node:url';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { BaseRequest } from '../base-request';
import { CorosResponse } from '../common';
import { CorosConfigService } from '../coros.config';
import { CorosAuthenticationService } from '../coros-authentication.service';

/**
 * Input for deleting training plans
 * Array of plan IDs to delete
 */
export const DeleteTrainingPlanInput = z.array(z.string());
export type DeleteTrainingPlanInput = z.infer<typeof DeleteTrainingPlanInput>;

/**
 * Response data from deleting training plans
 * The API may return undefined on successful deletion
 */
export const DeleteTrainingPlanData = z.undefined().optional();
export type DeleteTrainingPlanData = z.infer<typeof DeleteTrainingPlanData>;

export const DeleteTrainingPlanResponse = CorosResponse(DeleteTrainingPlanData);
export type DeleteTrainingPlanResponse = z.infer<typeof DeleteTrainingPlanResponse>;

@Injectable()
export class DeleteTrainingPlanRequest extends BaseRequest<DeleteTrainingPlanInput, DeleteTrainingPlanResponse, void> {
  private readonly logger = new Logger(DeleteTrainingPlanRequest.name);
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

  protected inputValidator(): z.Schema<DeleteTrainingPlanInput> {
    return DeleteTrainingPlanInput;
  }

  protected responseValidator(): z.Schema<DeleteTrainingPlanResponse> {
    return DeleteTrainingPlanResponse;
  }

  protected async handle(planIds: DeleteTrainingPlanInput): Promise<void> {
    const url = new URL('/training/plan/delete', this.corosConfig.apiUrl);

    this.logger.debug('Delete training plan IDs:', planIds);

    const { data } = await this.httpService.axiosRef.post(url.toString(), planIds, {
      headers: {
        accesstoken: this.corosAuthenticationService.accessToken,
      },
    });

    this.logger.verbose('Delete training plan request response', data);

    this.assertCorosResponseBase(data);
    this.assertCorosResponse(data);
  }
}
