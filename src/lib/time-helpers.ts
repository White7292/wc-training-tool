export function printTime(durationInMilliseconds: number): string {
	durationInMilliseconds = durationInMilliseconds / 1000;
	const hours = Math.floor(durationInMilliseconds / 3600);

	durationInMilliseconds = durationInMilliseconds - hours * 3600;
	const minutes = Math.floor(durationInMilliseconds / 60);
	const seconds = durationInMilliseconds - minutes * 60;

	const hoursString = hours.toString().padStart(2, '0');
	const minutesString = minutes.toString().padStart(2, '0');
	const secondsString = seconds.toString().padStart(2, '0');

	return `${hoursString}:${minutesString}:${secondsString}`;
}
