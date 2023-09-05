export function printTime(duration: number): string {
	const hours = Math.floor(duration / 3600);

	duration = duration - hours * 3600;
	const minutes = Math.floor(duration / 60);
	const seconds = duration - minutes * 60;

	const hoursString = hours.toString().padStart(2, '0');
	const minutesString = minutes.toString().padStart(2, '0');
	const secondsString = seconds.toString().padStart(2, '0');

	return `${hoursString}:${minutesString}:${secondsString}`;
}
