import { ExtractedIdea, AtomicNote, Clipping } from "../types/entities";
import { slugify } from "../utils/strings";

export class AtomicNoteBuilder {
	build(clipping: Clipping, ideas: ExtractedIdea[]): AtomicNote[] {
		const timestamp = Date.now();

		return ideas.map((idea, index) => {
			const id = `${clipping.id}#${timestamp}-${index}`;
			return {
				id,
				title: idea.label.trim(),
				body: idea.idea.trim(),
				tags: idea.tags ?? [],
				sourceClippingId: clipping.id,
				timestamp,
			};
		});
	}

	filenameFor(note: AtomicNote): string {
		const slug = slugify(note.title);
		return `${slug}.md`;
	}
}
