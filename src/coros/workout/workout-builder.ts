import {
  ExerciseType,
  HrType,
  IntensityType,
  RestType,
  TargetType,
  type Workout,
  type WorkoutExercise,
} from './workout-types';

/**
 * Builder class to help construct Coros workouts programmatically
 */
export class WorkoutBuilder {
  private exercises: WorkoutExercise[] = [];
  private nextId = 1;
  private nextSortNo = 1;
  private overview = '';

  constructor(
    private name: string,
    private sportType = 1, // 1 = running
  ) {}

  /**
   * Set the workout description/overview
   */
  setOverview(overview: string): this {
    this.overview = overview;
    return this;
  }

  /**
   * Add a warm-up exercise
   */
  addWarmUp(params: {
    targetType: TargetType;
    targetValue: number;
    name?: string;
    intensityType?: IntensityType;
    intensityValue?: number;
    intensityValueExtend?: number;
    intensityPercent?: number;
    intensityPercentExtend?: number;
  }): this {
    const intensityType = params.intensityType || IntensityType.None;
    const isHeartRate = intensityType === IntensityType.HeartRate;
    const isPace = intensityType === IntensityType.Pace;

    this.exercises.push({
      access: 0,
      id: this.nextId++,
      sortNo: this.nextSortNo++,
      exerciseType: ExerciseType.WarmUp,
      name: params.name || 'Warm Up',
      targetType: params.targetType,
      targetValue: params.targetValue,
      intensityType,
      intensityValue: params.intensityValue || 0,
      intensityValueExtend: params.intensityValueExtend || 0,
      sportType: this.sportType,
      defaultOrder: 1,
      sets: 1,
      groupId: '',
      hrType: isHeartRate ? HrType.ReserveHeartRate : HrType.None,
      intensityCustom: 0,
      intensityDisplayUnit: isPace ? 1 : 0,
      intensityMultiplier: isPace ? 1000 : 0,
      intensityPercent: params.intensityPercent || 0,
      intensityPercentExtend: params.intensityPercentExtend || 0,
      isDefaultAdd: 0,
      isGroup: false,
      isIntensityPercent: isHeartRate && (params.intensityPercent || 0) > 0,
      originId: '',
      overview: 'sid_run_warm_up_dist',
      restType: RestType.Time,
      restValue: 0,
      sourceId: '0',
      sourceUrl: '',
      subType: 0,
      targetDisplayUnit: 0,
      userId: 0,
      videoUrl: '',
    });
    return this;
  }

  /**
   * Add a training/work exercise
   */
  addTraining(params: {
    targetType: TargetType;
    targetValue: number;
    name?: string;
    intensityType?: IntensityType;
    intensityValue?: number;
    intensityValueExtend?: number;
    intensityPercent?: number;
    intensityPercentExtend?: number;
    groupId?: number | string;
  }): this {
    const intensityType = params.intensityType || IntensityType.None;
    const isHeartRate = intensityType === IntensityType.HeartRate;
    const isPace = intensityType === IntensityType.Pace;

    this.exercises.push({
      access: 0,
      id: this.nextId++,
      sortNo: this.nextSortNo++,
      exerciseType: ExerciseType.Training,
      name: params.name || 'Training',
      targetType: params.targetType,
      targetValue: params.targetValue,
      intensityType,
      intensityValue: params.intensityValue || 0,
      intensityValueExtend: params.intensityValueExtend || 0,
      intensityPercent: params.intensityPercent || 0,
      intensityPercentExtend: params.intensityPercentExtend || 0,
      groupId: params.groupId?.toString() || '',
      sportType: this.sportType,
      defaultOrder: 2,
      sets: 1,
      hrType: isHeartRate ? HrType.ReserveHeartRate : HrType.None,
      intensityCustom: 0,
      intensityDisplayUnit: isPace ? 1 : 0,
      intensityMultiplier: isPace ? 1000 : 0,
      isDefaultAdd: 1,
      isGroup: false,
      isIntensityPercent: isHeartRate && (params.intensityPercent || 0) > 0,
      originId: '',
      overview: 'sid_run_training',
      restType: RestType.Time,
      restValue: 0,
      sourceId: '0',
      sourceUrl: '',
      subType: 0,
      targetDisplayUnit: 0,
      userId: 0,
      videoUrl: '',
    });
    return this;
  }

  /**
   * Add a rest exercise
   */
  addRest(params: { duration: number; name?: string; groupId?: number | string }): this {
    this.exercises.push({
      access: 0,
      id: this.nextId++,
      sortNo: this.nextSortNo++,
      exerciseType: ExerciseType.Rest,
      name: params.name || 'Rest',
      targetType: TargetType.Time,
      targetValue: params.duration,
      groupId: params.groupId?.toString() || '',
      sportType: this.sportType,
      defaultOrder: 3,
      sets: 1,
      hrType: HrType.None,
      intensityCustom: 0,
      intensityDisplayUnit: 0,
      intensityMultiplier: 0,
      intensityPercent: 0,
      intensityPercentExtend: 0,
      intensityType: IntensityType.None,
      intensityValue: 0,
      intensityValueExtend: 0,
      isDefaultAdd: 0,
      isGroup: false,
      isIntensityPercent: false,
      originId: '',
      overview: 'sid_run_cool_down_dist',
      restType: RestType.Time,
      restValue: 0,
      sourceId: '0',
      sourceUrl: '',
      subType: 0,
      targetDisplayUnit: 0,
      userId: 0,
      videoUrl: '',
    });
    return this;
  }

  /**
   * Add a cool-down exercise
   */
  addCoolDown(params: {
    targetType: TargetType;
    targetValue: number;
    name?: string;
    intensityType?: IntensityType;
    intensityValue?: number;
    intensityValueExtend?: number;
    intensityPercent?: number;
    intensityPercentExtend?: number;
  }): this {
    const intensityType = params.intensityType || IntensityType.None;
    const isHeartRate = intensityType === IntensityType.HeartRate;
    const isPace = intensityType === IntensityType.Pace;

    this.exercises.push({
      access: 0,
      id: this.nextId++,
      sortNo: this.nextSortNo++,
      exerciseType: ExerciseType.CoolDown,
      name: params.name || 'Cool Down',
      targetType: params.targetType,
      targetValue: params.targetValue,
      intensityType,
      sportType: this.sportType,
      defaultOrder: 3,
      sets: 1,
      groupId: '',
      hrType: isHeartRate ? HrType.ReserveHeartRate : HrType.None,
      intensityCustom: 0,
      intensityDisplayUnit: isPace ? 1 : 0,
      intensityMultiplier: isPace ? 1000 : 0,
      intensityPercent: params.intensityPercent || 0,
      intensityPercentExtend: params.intensityPercentExtend || 0,
      intensityValue: params.intensityValue || 0,
      intensityValueExtend: params.intensityValueExtend || 0,
      isDefaultAdd: 0,
      isGroup: false,
      isIntensityPercent: isHeartRate && (params.intensityPercent || 0) > 0,
      originId: '',
      overview: 'sid_run_cool_down_dist',
      restType: RestType.Time,
      restValue: 0,
      sourceId: '0',
      sourceUrl: '',
      subType: 0,
      targetDisplayUnit: 0,
      userId: 0,
      videoUrl: '',
    });
    return this;
  }

  /**
   * Add a group (for intervals/repeats)
   */
  addGroup(params: { sets: number; restValue?: number }): this {
    this.exercises.push({
      access: 0,
      id: this.nextId++,
      sortNo: this.nextSortNo++,
      exerciseType: ExerciseType.Group,
      name: '',
      isGroup: true,
      sets: params.sets,
      restValue: params.restValue || 0,
      restType: RestType.Time,
      groupId: '',
      sportType: 0,
      defaultOrder: 0,
      hrType: HrType.None,
      intensityCustom: 0,
      intensityDisplayUnit: 0,
      intensityMultiplier: 0,
      intensityPercent: 0,
      intensityPercentExtend: 0,
      intensityType: IntensityType.None,
      intensityValue: 0,
      intensityValueExtend: 0,
      isDefaultAdd: 0,
      isIntensityPercent: false,
      originId: '',
      overview: '',
      sourceId: '0',
      sourceUrl: '',
      subType: 0,
      targetType: '',
      targetValue: 0,
      targetDisplayUnit: 0,
      userId: 0,
      videoUrl: '',
    });
    return this;
  }

  /**
   * Calculate total distance in centimeters
   */
  private calculateTotalDistance(): number {
    return this.exercises.reduce((total, exercise) => {
      if (exercise.targetType === TargetType.Distance) {
        const sets = exercise.groupId ? this.getGroupSets(exercise.groupId) : 1;
        return total + exercise.targetValue * sets;
      }
      return total;
    }, 0);
  }

  /**
   * Calculate total duration in seconds
   */
  private calculateTotalDuration(): number {
    return this.exercises.reduce((total, exercise) => {
      if (exercise.targetType === TargetType.Time) {
        const sets = exercise.groupId ? this.getGroupSets(exercise.groupId) : 1;
        return total + exercise.targetValue * sets;
      }
      return total;
    }, 0);
  }

  /**
   * Get the number of sets for a group
   */
  private getGroupSets(groupId: string | number): number {
    const group = this.exercises.find((ex) => ex.id === Number(groupId) && ex.isGroup);
    return group?.sets || 1;
  }

  /**
   * Calculate total sets (including group repetitions)
   */
  private calculateTotalSets(): number {
    return this.exercises.reduce((total, exercise) => {
      if (exercise.isGroup) {
        return total + exercise.sets;
      }
      if (!exercise.groupId) {
        return total + 1;
      }
      return total;
    }, 0);
  }

  /**
   * Generate exercise bar chart for visualization
   */
  private generateExerciseBarChart() {
    // Filter out group exercises and calculate total value for width calculation
    const nonGroupExercises = this.exercises.filter((ex) => !ex.isGroup);
    const totalValue = nonGroupExercises.reduce((sum, ex) => sum + ex.targetValue, 0);

    return nonGroupExercises.map((exercise) => {
      const sets = exercise.groupId ? this.getGroupSets(exercise.groupId) : 1;
      const value = exercise.targetValue * sets;
      const width = totalValue > 0 ? Math.round((value / totalValue) * 100) : 100;

      // Calculate height based on intensity (0-100 scale)
      let height = 50; // Default medium intensity
      if (exercise.intensityPercent > 0) {
        // For heart rate reserve percentage (0-100000 basis points)
        height = Math.round((exercise.intensityPercent / 1000) * 1.33); // Scale to 0-133
      } else if (exercise.intensityValue > 0 && exercise.intensityType === IntensityType.HeartRate) {
        // For absolute heart rate (assume 120-180 range maps to 0-100)
        height = Math.round(((exercise.intensityValue - 120) / 60) * 100);
      }
      height = Math.max(0, Math.min(100, height)); // Clamp to 0-100

      // Ensure targetType is a TargetType enum value, not a string
      const targetType =
        typeof exercise.targetType === 'string' ? TargetType.Distance : (exercise.targetType as TargetType);

      return {
        exerciseId: String(exercise.id),
        exerciseType: exercise.exerciseType,
        height,
        name: exercise.name,
        targetType,
        targetValue: exercise.targetValue,
        value: exercise.targetValue,
        width,
        widthFill: 0,
      };
    });
  }

  /**
   * Build the complete workout object
   */
  build(): Workout {
    const totalDistance = this.calculateTotalDistance();
    const totalDuration = this.calculateTotalDuration();
    const totalSets = this.calculateTotalSets();
    const exerciseBarChart = this.generateExerciseBarChart();

    return {
      name: this.name,
      sportType: this.sportType,
      exercises: this.exercises,
      exerciseBarChart,
      distance: (totalDistance / 100).toFixed(2), // Convert cm to meters
      duration: totalDuration,
      totalSets,
      sets: totalSets,
      trainingLoad: Math.round(totalDuration / 60), // Rough estimate
      pbVersion: this.exercises.some((ex) => ex.isGroup) ? 5 : 2,
      sourceId: '425868142590476288', // Default source ID from examples
      sourceUrl: 'https://d31oxp44ddzkyk.cloudfront.net/source/source_default/0/1a3b389aac8a4fe5915860cef62b2b5b.jpg',
      referExercise: {
        intensityType: 0,
        hrType: 0,
        valueType: 0,
      },
      access: 1,
      authorId: '0',
      createTimestamp: 0,
      essence: 0,
      estimatedType: 0,
      estimatedValue: 0,
      exerciseNum: 0,
      headPic: '',
      id: '0',
      idInPlan: '0',
      nickname: '',
      originEssence: 0,
      overview: this.overview,
      pitch: 0,
      planIdIndex: 0,
      poolLength: 2500,
      poolLengthId: 1,
      poolLengthUnit: 2,
      profile: '',
      sex: 0,
      shareUrl: '',
      simple: false,
      star: 0,
      subType: 65535,
      targetType: 0,
      targetValue: 0,
      thirdPartyId: 0,
      type: 0,
      unit: 0,
      userId: '0',
      version: 0,
      videoCoverUrl: '',
      videoUrl: '',
    };
  }
}
