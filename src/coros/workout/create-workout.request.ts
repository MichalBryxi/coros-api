import { URL } from 'node:url';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { BaseRequest } from '../base-request';
import { CorosResponse } from '../common';
import { CorosConfigService } from '../coros.config';
import { CorosAuthenticationService } from '../coros-authentication.service';
import { Workout } from './workout-types';

/**
 * Response data from creating a workout
 * The API can return either a string (programId) or an object with programId and message
 */
export const CreateWorkoutData = z.union([
  z.string(), // Just the programId
  z.object({
    programId: z.string(),
    message: z.string().optional(),
  }),
]);
export type CreateWorkoutData = z.infer<typeof CreateWorkoutData>;

export const CreateWorkoutResponse = CorosResponse(CreateWorkoutData);
export type CreateWorkoutResponse = z.infer<typeof CreateWorkoutResponse>;

/**
 * Input for creating a workout
 */
const CreateWorkoutInput = Workout;
type CreateWorkoutInput = z.infer<typeof CreateWorkoutInput>;

@Injectable()
export class CreateWorkoutRequest extends BaseRequest<
  CreateWorkoutInput,
  CreateWorkoutResponse,
  { programId: string; message?: string }
> {
  private readonly logger = new Logger(CreateWorkoutRequest.name);
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

  protected inputValidator(): z.Schema<CreateWorkoutInput> {
    return CreateWorkoutInput;
  }

  protected responseValidator(): z.Schema<CreateWorkoutResponse> {
    return CreateWorkoutResponse;
  }

  protected async handle(workout: CreateWorkoutInput): Promise<{ programId: string; message?: string }> {
    const url = new URL('/training/program/add', this.corosConfig.apiUrl);

    const { data } = await this.httpService.axiosRef.post(url.toString(), workout, {
      headers: {
        accesstoken: this.corosAuthenticationService.accessToken,
      },
    });

    this.logger.verbose('Create workout request response', data);

    this.assertCorosResponseBase(data);
    this.assertCorosResponse(data);

    // Normalize the response - API can return either a string or an object
    const responseData = data.data;
    if (typeof responseData === 'string') {
      return { programId: responseData };
    }
    return responseData;
  }
}
