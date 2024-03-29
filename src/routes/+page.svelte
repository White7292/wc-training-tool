<script lang="ts">
	import { printTime } from '../lib/time-helpers';

	import NorthWestArrow from '../lib/assets/arrow_north_west.svelte';
	import NorthArrow from '../lib/assets/arrow_north.svelte';
	import NorthEastArrow from '../lib/assets/arrow_north_east.svelte';

	import WestArrow from '../lib/assets/arrow_west.svelte';
	import Center from '../lib/assets/center_filter_tilt_shift.svelte';
	import EastArrow from '../lib/assets/arrow_east.svelte';

	import SouthWestArrow from '../lib/assets/arrow_south_west.svelte';
	import SouthArrow from '../lib/assets/arrow_south.svelte';
	import SouthEastArrow from '../lib/assets/arrow_south_east.svelte';

	// TYPES
	//=========================
	type StepMatrixPossibilities =
		| typeof NorthWestArrow
		| typeof NorthArrow
		| typeof NorthEastArrow
		| typeof WestArrow
		| typeof Center
		| typeof EastArrow
		| typeof SouthWestArrow
		| typeof SouthArrow
		| typeof SouthEastArrow;

	// VARIABLES
	//=========================
	const stepMatrixPossibilities: StepMatrixPossibilities[][] = [
		[NorthWestArrow, NorthArrow, NorthEastArrow],
		[WestArrow, Center, EastArrow],
		[SouthWestArrow, SouthArrow, SouthEastArrow]
	];

	let defaultStepMatrix: StepMatrixPossibilities[][] | undefined[][] = new Array(3)
		.fill(undefined)
		.map(() => new Array(3).fill(undefined));

	let stepMatrix = defaultStepMatrix;

	let arrowProps = { size: 200 };

	let selectRandomStepInterval: NodeJS.Timeout;
	let elapsedTimeInterval: NodeJS.Timeout;

	let startTime: number;

	// REACTIVE VARIABLES
	//=========================
	// Control Flow
	$: isRunning = false;
	$: hasStarted = false;

	// User Inputs
	$: inputDrillDuration = 65;
	$: drillDuration = inputDrillDuration * 1000;

	$: inputStepDuration = 5;
	$: stepDuration = inputStepDuration * 1000;

	// Timer
	$: elapsedTime = 0;
	$: timeLeft = drillDuration - elapsedTime;

	// FUNCTIONS
	//=========================
	function selectRandomStep(): void {
		var rand1 = Math.floor(Math.random() * stepMatrix.length);
		var rand2 = Math.floor(Math.random() * stepMatrix[0].length);

		// TODO (#368): Implement "back to center" mode.
		// Ensure that we're not picking the same square again to keep things dynamic.
		while (stepMatrix[rand1][rand2] === stepMatrixPossibilities[rand1][rand2]) {
			rand1 = Math.floor(Math.random() * stepMatrix.length);
			rand2 = Math.floor(Math.random() * stepMatrix[0].length);
		}

		let tempMatrix = new Array(3).fill(undefined).map(() => new Array(3).fill(undefined));

		tempMatrix[rand1][rand2] = stepMatrixPossibilities[rand1][rand2];

		stepMatrix = tempMatrix;
	}

	function incrementTimerByOneSecond(startTime: number): void {
		// Rounds down to the nearest second.
		elapsedTime = Math.floor((Date.now() - startTime) / 1000) * 1000;
	}

	function startFootworkDrill(): void {
		resetIntervals();

		startTime = Date.now();
		let tempStartTime = startTime;

		if (hasStarted) {
			tempStartTime -= elapsedTime;
		}

		elapsedTimeInterval = setInterval(() => incrementTimerByOneSecond(tempStartTime), 1000);

		selectRandomStepInterval = setInterval(selectRandomStep, stepDuration);

		isRunning = true;
		hasStarted = true;
	}

	function stopFootworkDrill(): void {
		resetIntervals();
		isRunning = false;
	}

	function resetFootworkDrill(): void {
		stepMatrix = defaultStepMatrix;
		stopFootworkDrill();

		elapsedTime = 0;
		startTime = Date.now();
		hasStarted = false;
	}

	function resetIntervals(): void {
		if (selectRandomStepInterval) {
			clearInterval(selectRandomStepInterval);
		}
		if (elapsedTimeInterval) {
			clearInterval(elapsedTimeInterval);
		}
	}
</script>

<div class="drill-display-container">
	<table>
		{#each stepMatrix as row, i}
			<tr>
				{#each row as step, j}
					<td>
						{#if step}
							<div class="active-step step-cell">
								<svelte:component this={step} {...arrowProps} />
							</div>
						{:else}
							<div class="inactive-step step-cell">
								<svelte:component this={stepMatrixPossibilities[i][j]} {...arrowProps} />
							</div>
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</table>
</div>

<div class="drill-controls">
	<div class="timer-container">
		<span class="time-display">
			{printTime(elapsedTime)} / {printTime(drillDuration)}
			{#if elapsedTime > drillDuration}
				(+{printTime(Math.abs(timeLeft))})
			{:else}
				(-{printTime(Math.abs(timeLeft))})
			{/if}
		</span>
	</div>
	<div class="buttons-container">
		{#if !isRunning}
			<button on:click={startFootworkDrill}>Start</button>
		{:else}
			<button on:click={stopFootworkDrill}>Stop</button>
		{/if}
		<button on:click={resetFootworkDrill}>Reset</button>
	</div>

	<div class="input-container">
		<label for="inputDrillDuration">Drill Duration (seconds)</label>
		<input
			name="inputDrillDuration"
			type="number"
			bind:value={inputDrillDuration}
			disabled={isRunning}
		/>
	</div>

	<div class="input-container">
		<label for="inputStepDuration">Step Duration (seconds)</label>
		<input
			name="inputStepDuration"
			type="number"
			bind:value={inputStepDuration}
			disabled={isRunning}
		/>
	</div>
</div>

<style>
	.step-cell {
		height: 100%;
		width: 100%;
		text-align: center;
	}

	.active-step {
		background-color: red;
	}

	.inactive-step {
		background-color: lightgray;
	}

	.time-display {
		font-size: 92px;
	}
</style>
