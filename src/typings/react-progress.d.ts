declare namespace reactProgress {
    export interface ProgressProps {
		color?: string;
		percent: number;
		hideDelay?: number;
		speed?: number;
	}

    export default class Progress extends React.Component<ProgressProps, {}> {
		new (props: ProgressProps, context?: any)
    }
}
declare var Progress: typeof reactProgress.Progress
declare module 'react-progress' {
    export = Progress;
}
