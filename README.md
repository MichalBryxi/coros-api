# Bulk export Coros activities

⚠️ This repository is using a **non-public API** from [COROS Training Hub](https://t.coros.com/) that could break
anytime.

> Bulk export your Coros activities to FIT to import them in a 3rd party

## Getting started

- Install Node.js (see [.nvmrc](.nvmrc) for the supported version)
- Install [pnpm](https://pnpm.io/installation)
- Run `pnpm install`
- Create a `.env` file (see [.env.example](.env.example)) with your email, password and the Coros API URL
- Run `pnpm nest start -- export-activities -out OUT_DIR`.

**Options:**

```
  -o, --out [outDir]              Output directory
  --exportType <fileType>         Export data type (choices: "fit", "tcx", "gpx", "kml", "csv", default: "fit")
  --exportSportTypes <sportType>  Export sport types, comma separated (choices: "all", "run", "indoorRun", "trailRun", "trackRun", "hike", "mtnClimb", "bike", "indoorBike", "roadEbike", "gravelRoadBike", "mountainRiding", "mountainEbike", "helmetBike", "poolSwim", "openWater", "triathlon", "strength", "gymCardio", "gpsCardio", "ski", "snowboard", "xcSki", "skiTouring", "skiTouringOld", "multiSport", "speedsurfing", "windsurfing", "row", "indoorRow", "whitewater", "flatwater", "multiPitch", "climb", "indoorClimb", "bouldering", "walk", "jumpRope", "climbStairs", "customSport", default: "all")
  --fromDate <from>               Export activities created after this date (inclusive). Format must be YYYY-MM-DD
  --toDate <to>                   Export activities created before this date (inclusive). Format must be YYYY-MM-DD
  -h, --help                      display help for command
```

Examples:

```shell
# Download all activities in fit format in Downloads folder
pnpm nest start -- export-activities -o ~/Downloads

# Download all activities between 2025-01-01 and 2025-02-01 in fit format in Downloads folder
pnpm nest start -- export-activities --fromDate 2025-01-01 --toDate 2025-02-01 -o ~/Downloads

# Download all activities in gpx format in Downloads folder
pnpm nest start -- export-activities --exportType gpx -o ~/Downloads

# Download all walk and run in gpx format in Downloads folder
pnpm nest start -- export-activities --exportType gpx --exportSportTypes walk,run -o ~/Downloads
```

## Export Training Schedule

Exports your training calendar schedule for today through the next 7 days into an ICS file.

**Usage:**

```shell
pnpm nest start -- export-training-schedule -o ~/Downloads
```

This creates a file named `training-schedule-YYYY-MM-DD-to-YYYY-MM-DD.ics` in the output directory.

## Import Training Plans from CSV

You can create and import complete training plans with scheduled workouts using a single CSV file that includes both the schedule and workout definitions.

### Quick Start

```bash
# Import a training plan
pnpm nest start -- import-training-plan --file training-plan-example.csv

# Dry run (validate without creating)
pnpm nest start -- import-training-plan --file training-plan-example.csv --dry-run
```

### CSV Format

The CSV file combines the training plan schedule with workout definitions:

```csv
plan_name,week,day,workout_name,description,exercise_type,target_type,target_value,intensity_type,intensity_min,intensity_max,sets,rest_seconds,name
```

**Columns:**
- `plan_name` - Name of your training plan (same for all rows)
- `week` - Week number (1-based, e.g., 1, 2, 3...)
- `day` - Day of the week (1=Monday, 7=Sunday)
- `workout_name` - Name of the workout
- `description` - Description/notes for the workout (optional, shown in COROS app)
- `exercise_type` - Type of exercise: `warmup`, `training`, `cooldown`, `rest`, or `group`
- `target_type` - Target metric: `distance` (meters) or `time` (seconds or MM:SS)
- `target_value` - Value for the target (e.g., `5000` for 5km, `1800` or `30:00` for 30 minutes)
- `intensity_type` - Intensity zone: `hr` (heart rate BPM), `hrr` (% heart rate reserve), or `pace` (MM:SS/km)
- `intensity_min` - Minimum intensity (e.g., `137` for HR, `60` for HRR%, `4:30` for pace)
- `intensity_max` - Maximum intensity (e.g., `151` for HR, `70` for HRR%, `5:00` for pace)
- `sets` - Number of sets (only for `group` exercise type)
- `rest_seconds` - Rest duration in seconds (only for `group` exercise type)
- `name` - Custom name for the exercise (optional)

### Example

```csv
plan_name,week,day,workout_name,description,exercise_type,target_type,target_value,intensity_type,intensity_min,intensity_max,sets,rest_seconds,name
8-Week 5K Plan,1,1,Week 1 - Intervals,Focus on form during sprints,warmup,distance,1500,hrr,60,68,,,Warm Up
8-Week 5K Plan,1,1,Week 1 - Intervals,Focus on form during sprints,group,,,,,,8,90,
8-Week 5K Plan,1,1,Week 1 - Intervals,Focus on form during sprints,training,distance,400,pace,5:50,5:50,,,400m Sprint
8-Week 5K Plan,1,1,Week 1 - Intervals,Focus on form during sprints,rest,time,90,,,,,,Walk Rest
8-Week 5K Plan,1,1,Week 1 - Intervals,Focus on form during sprints,cooldown,distance,1500,hrr,60,68,,,Cool Down
8-Week 5K Plan,1,2,Week 1 - Easy Run,Keep it conversational pace,training,distance,5000,hrr,60,70,,,Easy Run
8-Week 5K Plan,1,4,Week 1 - Long Run,Build endurance steadily,training,distance,10000,hrr,60,75,,,Long Run
```

This creates:
- **Week 1, Day 1 (Monday)**: Interval workout with 8x400m sprints
- **Week 1, Day 2 (Tuesday)**: 5km easy run
- **Week 1, Day 4 (Thursday)**: 10km long run

For detailed documentation, see [Training Plan CSV Documentation](src/training-plan-csv/README.md)

## API Documentation

The API used by this project are documented using [Bruno](https://www.usebruno.com/) in the [api folder](./api).

## Licence

[MIT License](LICENSE.md)
