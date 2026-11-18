/** One stage of an artwork walkthrough; index + 1 is the `stage` passed to the artwork. */
export type WalkthroughStep = {
	title: string;
	note: string;
	code: string;
};
