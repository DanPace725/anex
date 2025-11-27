export interface Clipping {
	id: string;
	path: string;
	text: string;
	processed: boolean;
}

export interface ExtractedIdea {
	label: string;
	idea: string;
	tags?: string[];
}

export interface AtomicNote {
	id: string;
	title: string;
	body: string;
	tags: string[];
	sourceClippingId: string;
	sourceTitle: string;
	timestamp: number;
}
