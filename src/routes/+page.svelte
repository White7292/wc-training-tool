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

	// Reactive variables.
	$: isRunning = false;
	$: hasStarted = false;
	$: drillDuration = 65;
	$: stepDuration = 5;
	$: elapsedTime = 0;
	$: timeLeft = drillDuration - elapsedTime;

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

	function startFootworkDrill(): void {
		startTime = Date.now();

		if (hasStarted) {
			elapsedTimeInterval = setInterval(
				() => (elapsedTime += Math.floor((Date.now() - startTime) / 1000)),
				1000
			);
		} else {
			elapsedTimeInterval = setInterval(
				() => (elapsedTime = Math.floor((Date.now() - startTime) / 1000)),
				1000
			);
		}

		selectRandomStepInterval = setInterval(selectRandomStep, stepDuration * 1000);

		isRunning = true;
		hasStarted = true;
	}

	function stopFootworkDrill(): void {
		if (selectRandomStepInterval) {
			clearInterval(selectRandomStepInterval);
		}
		if (elapsedTimeInterval) {
			clearInterval(elapsedTimeInterval);
		}
		isRunning = false;
	}

	function resetFootworkDrill(): void {
		stepMatrix = defaultStepMatrix;
		stopFootworkDrill();

		elapsedTime = 0;
		startTime = Date.now();
		hasStarted = false;
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
	<div class="buttons-container">
		{#if !isRunning}
			<button on:click={startFootworkDrill}>Start</button>
		{:else}
			<button on:click={stopFootworkDrill}>Stop</button>
		{/if}
		<button on:click={resetFootworkDrill}>Reset</button>
		<span class="time-display">
			{printTime(elapsedTime)} / {printTime(drillDuration)} (-{printTime(timeLeft)})
		</span>
	</div>

	<div class="input-container">
		<label for="drillDuration">Drill Duration (seconds)</label>
		<input name="drillDuration" type="number" bind:value={drillDuration} disabled={isRunning} />
	</div>

	<div class="input-container">
		<label for="stepDuration">Step Duration (seconds)</label>
		<input name="stepDuration" type="number" bind:value={stepDuration} disabled={isRunning} />
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
		font-size: 24px;
	}
</style>
