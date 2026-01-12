import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExportActivitiesCommandRunner } from './command-runner/export-activities.command-runner';
import { ImportTrainingPlanCommandRunner } from './command-runner/import-training-plan.command-runner';
import { DownloadFile } from './core/download-file.service';
import { CorosModule } from './coros/coros.module';
import { TrainingPlanCsvParserService } from './training-plan-csv/training-plan-csv-parser.service';

@Module({
  imports: [CorosModule, HttpModule],
  providers: [
    ExportActivitiesCommandRunner,
    ImportTrainingPlanCommandRunner,
    DownloadFile,
    TrainingPlanCsvParserService,
  ],
})
export class AppModule {}
