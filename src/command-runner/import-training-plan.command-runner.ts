import { existsSync } from 'node:fs';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { CorosAPI } from '../coros/coros-api';
import { TrainingPlanCsvParserService } from '../training-plan-csv/training-plan-csv-parser.service';
import { InvalidParameterError } from './invalid-parameter-error';

type Flags = {
  file: string;
  dryRun: boolean;
};

@Command({
  name: 'import-training-plan',
  description: 'Import a training plan from a CSV file and create it in Coros Training Hub',
})
export class ImportTrainingPlanCommandRunner extends CommandRunner {
  private readonly logger = new Logger(ImportTrainingPlanCommandRunner.name);
  private readonly corosAPI: CorosAPI;
  private readonly planCsvParser: TrainingPlanCsvParserService;

  constructor(corosAPI: CorosAPI, planCsvParser: TrainingPlanCsvParserService) {
    super();
    this.corosAPI = corosAPI;
    this.planCsvParser = planCsvParser;
  }

  async run(_passedParams: string[], flags: Flags): Promise<void> {
    this.logger.log(`Importing training plan from: ${flags.file}`);

    // Parse CSV file
    const plan = this.planCsvParser.parseFile(flags.file);
    this.logger.log(`Parsed training plan: ${plan.name}`);
    this.logger.log(`  Total weeks: ${plan.minWeeks}`);
    this.logger.log(`  Total workouts: ${plan.programs.length}`);
    this.logger.log(`  Total days: ${plan.totalDay}`);

    if (flags.dryRun) {
      this.logger.log('\nDry run mode - training plan will not be created');
      this.logger.log('\nSchedule:');
      for (const entity of plan.entities) {
        const program = plan.programs.find((p) => p.idInPlan === entity.idInPlan);
        const week = Math.floor(entity.dayNo / 7) + 1;
        const day = (entity.dayNo % 7) + 1;
        this.logger.log(`  Week ${week}, Day ${day}: ${program?.name}`);
      }
      return;
    }

    // Login to Coros
    await this.corosAPI.login();
    this.logger.log('Login successful');

    // Check if a plan with the same name already exists
    this.logger.log(`Checking for existing training plan: ${plan.name}...`);
    const existingPlans = await this.corosAPI.queryTrainingPlans({ name: plan.name });
    let existingPlan = existingPlans.find((p) => p.name === plan.name);

    // If we found an existing plan, fetch its full details (including programs)
    if (existingPlan) {
      this.logger.log(`Fetching full details for plan ID: ${existingPlan.id}...`);
      existingPlan = await this.corosAPI.getTrainingPlanDetail(existingPlan.id);
    }

    try {
      if (existingPlan) {
        // Update existing plan
        this.logger.log(`Found existing plan (ID: ${existingPlan.id}). Updating...`);
        const result = await this.corosAPI.updateTrainingPlan(existingPlan, plan);
        this.logger.log('✓ Training plan updated successfully!');
        if (result.planId) {
          this.logger.log(`  Plan ID: ${result.planId}`);
        }
        if (result.message) {
          this.logger.log(`  Message: ${result.message}`);
        }
      } else {
        // Create new plan
        this.logger.log(`No existing plan found. Creating new training plan: ${plan.name}...`);
        const result = await this.corosAPI.createTrainingPlan(plan);
        this.logger.log('✓ Training plan created successfully!');
        if (result.planId) {
          this.logger.log(`  Plan ID: ${result.planId}`);
        }
        if (result.message) {
          this.logger.log(`  Message: ${result.message}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `✗ Failed to ${existingPlan ? 'update' : 'create'} training plan: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Option({
    name: 'file',
    flags: '-f, --file <file>',
    description: 'Path to the CSV file containing the training plan with workout definitions',
    required: true,
  })
  parseFile(file: string): string {
    if (!existsSync(file)) {
      throw new InvalidParameterError('file', file, 'File does not exist');
    }

    if (!file.toLowerCase().endsWith('.csv')) {
      throw new InvalidParameterError('file', file, 'File must be a CSV file');
    }

    return file;
  }

  @Option({
    name: 'dryRun',
    flags: '--dry-run',
    description: 'Parse and validate the CSV files without creating the training plan',
    defaultValue: false,
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }
}
