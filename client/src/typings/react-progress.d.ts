declare namespace reactProgress {
    export interface ProgressProps {
		color?: string;
		percent: number;
		hideDelay?: number;
		speed?: number;
	}

    export class Progress extends React.Component<ProgressProps, any> {
    }
}
declare var Progress: typeof reactProgress.Progress
declare module 'react-progress' {
    export = Progress;
}
