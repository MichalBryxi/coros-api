# Training Plan CSV Import

Import complete training plans from a single CSV file into Coros Training Hub.

## Overview

A training plan consists of:
1. **Schedule** - Which workouts happen on which days
2. **Workouts** - The actual workout definitions

Both are defined in a single CSV file with a unified format.

## CSV Format

The CSV file must have the following columns:

```csv
plan_name,week,day,workout_name,description,exercise_type,target_type,target_value,intensity_type,intensity_min,intensity_max,sets,rest_seconds,name
```

### Column Descriptions

**Schedule Columns:**
- **plan_name** - Name of the training plan (e.g., "8-Week 5K Plan") - must be the same for all rows
- **week** - Week number (1-based, e.g., 1, 2, 3...)
- **day** - Day of the week (1-7, where 1 = Monday, 7 = Sunday)
- **workout_name** - Name of the workout
- **description** - Description/overview of the workout (optional, only needs to be on the first row of each workout)

**Workout Definition Columns:**
- **exercise_type** - Type of exercise: `warmup`, `training`, `cooldown`, `rest`, or `group`
- **target_type** - Target metric: `distance` (meters) or `time` (seconds or MM:SS format)
- **target_value** - Value for the target (e.g., `5000` for 5km, `1800` or `30:00` for 30 minutes)
- **intensity_type** - Intensity zone: `hr` (heart rate BPM), `hrr` (% heart rate reserve), or `pace` (MM:SS/km)
- **intensity_min** - Minimum intensity (e.g., `137` for HR, `60` for HRR%, `4:30` for pace)
- **intensity_max** - Maximum intensity (e.g., `151` for HR, `70` for HRR%, `5:00` for pace)
- **sets** - Number of sets (only for `group` exercise type)
- **rest_seconds** - Rest duration in seconds (only for `group` exercise type)
- **name** - Custom name for the exercise (optional)

### Example

```csv
plan_name,week,day,workout_name,description,exercise_type,target_type,target_value,intensity_type,intensity_min,intensity_max,sets,rest_seconds,name
8-Week 5K Plan,1,1,Week 1 - Intervals,Interval training to build speed,warmup,distance,1500,hrr,60,68,,,Warm Up
8-Week 5K Plan,1,1,Week 1 - Intervals,,group,,,,,,8,90,
8-Week 5K Plan,1,1,Week 1 - Intervals,,training,distance,400,pace,5:50,5:50,,,400m Sprint
8-Week 5K Plan,1,1,Week 1 - Intervals,,rest,time,90,,,,,,Walk Rest
8-Week 5K Plan,1,1,Week 1 - Intervals,,cooldown,distance,1500,hrr,60,68,,,Cool Down
8-Week 5K Plan,1,2,Week 1 - Easy Run,Relaxed easy run to build aerobic base,training,distance,5000,hrr,60,70,,,Easy Run
8-Week 5K Plan,1,4,Week 1 - Long Run,Long steady run for endurance,training,distance,10000,hrr,60,75,,,Long Run
```

This creates a plan with:
- **Week 1, Day 1 (Monday)**: Interval workout with 8x400m sprints (90s rest between sets)
- **Week 1, Day 2 (Tuesday)**: 5km easy run at 60-70% HRR
- **Week 1, Day 4 (Thursday)**: 10km long run at 60-75% HRR

## Usage

### Import a Training Plan

```bash
pnpm nest start -- import-training-plan --file training-plan.csv
```

### Dry Run (Validate Without Creating)

```bash
pnpm nest start -- import-training-plan --file training-plan.csv --dry-run
```

## Complete Example

Create a single CSV file (`my-training-plan.csv`):

```csv
plan_name,week,day,workout_name,description,exercise_type,target_type,target_value,intensity_type,intensity_min,intensity_max,sets,rest_seconds,name
My 4-Week Plan,1,1,Week 1 - Intervals,Speed work with 400m repeats,warmup,distance,1500,hrr,60,68,,,Warm Up
My 4-Week Plan,1,1,Week 1 - Intervals,,group,,,,,,8,90,
My 4-Week Plan,1,1,Week 1 - Intervals,,training,distance,400,pace,5:50,5:50,,,400m Interval
My 4-Week Plan,1,1,Week 1 - Intervals,,rest,time,90,,,,,,90s Walk
My 4-Week Plan,1,1,Week 1 - Intervals,,cooldown,distance,1500,hrr,60,68,,,Cool Down
My 4-Week Plan,1,3,Week 1 - Easy Run,Easy aerobic run,training,distance,5000,hrr,60,70,,,Steady Easy
My 4-Week Plan,1,6,Week 1 - Long Run,Build endurance with long run,training,distance,10000,hrr,60,75,,,Relaxed Long Run
```

Import the training plan:

```bash
pnpm nest start -- import-training-plan --file my-training-plan.csv
```

## Notes

- **Distance values** are in meters (e.g., `5000` for 5km)
- **Time values** can be in seconds (e.g., `120`) or MM:SS format (e.g., `2:00`)
- **Pace values** must be in MM:SS format (e.g., `4:30` for 4:30/km)
- **Heart rate (hr)**: Absolute BPM values (e.g., `137,151` for 137-151 BPM)
- **Heart rate reserve (hrr)**: Percentage values (e.g., `60,70` for 60-70% HRR)
- **Group exercises**: Define repeated sets with `sets` and `rest_seconds` columns
- Week and day numbers are 1-based (Week 1 = first week, Day 1 = Monday)
- The plan name must be the same for all rows
- Workouts can be scheduled on any day of the week (1-7)
- You can skip days - not every day needs a workout
- Multiple rows with the same `week`, `day`, and `workout_name` define a single workout with multiple exercises
- **Updating existing plans**: If a plan with the same name already exists, it will be updated with the new data.

## Command Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--file` | `-f` | Path to training plan CSV file | Yes |
| `--dry-run` | | Validate without creating | No |

## See Also

- [Workout Builder](../coros/workout/workout-builder.ts) - Programmatic workout creation

