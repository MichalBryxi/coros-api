import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LoginRequest } from './account/login.request';
import { DownloadActivityDetailRequest } from './activity/download-activity-detail.request';
import { QueryActivitiesRequest } from './activity/query-activities.request';
import { CorosConfigService } from './coros.config';
import { CorosAPI } from './coros-api';
import { CorosAuthenticationService } from './coros-authentication.service';
import { CreateTrainingPlanRequest } from './training-plan/create-training-plan.request';
import { DeleteTrainingPlanRequest } from './training-plan/delete-training-plan.request';
import { GetTrainingPlanDetailRequest } from './training-plan/get-training-plan-detail.request';
import { QueryTrainingPlansRequest } from './training-plan/query-training-plans.request';
import { UpdateTrainingPlanRequest } from './training-plan/update-training-plan.request';
import { CreateWorkoutRequest } from './workout/create-workout.request';

@Module({
  imports: [HttpModule],
  providers: [
    CorosConfigService,
    CorosAuthenticationService,
    CorosAPI,
    LoginRequest,
    QueryActivitiesRequest,
    DownloadActivityDetailRequest,
    CreateWorkoutRequest,
    CreateTrainingPlanRequest,
    DeleteTrainingPlanRequest,
    GetTrainingPlanDetailRequest,
    QueryTrainingPlansRequest,
    UpdateTrainingPlanRequest,
  ],
  exports: [CorosAPI],
})
export class CorosModule {}
