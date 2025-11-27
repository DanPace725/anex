import { ExtractedIdea, AtomicNote, Clipping } from "../types/entities";
import { slugify } from "../utils/strings";

export class AtomicNoteBuilder {
	build(clipping: Clipping, ideas: ExtractedIdea[]): AtomicNote[] {
		const timestamp = Date.now();
		const sourceTitle = this.buildSourceTitle(clipping.path);

		return ideas.map((idea, index) => {
			const id = `${clipping.id}#${timestamp}-${index}`;
			return {
				id,
				title: idea.label.trim(),
				body: idea.idea.trim(),
				tags: idea.tags ?? [],
				sourceClippingId: clipping.id,
				sourceTitle,
				timestamp,
			};
		});
	}

	filenameFor(note: AtomicNote): string {
		const slug = slugify(note.title);
		return `${slug}.md`;
	}

	private buildSourceTitle(path: string): string {
		const filename = path.split("/").pop() ?? path;
		const stem = filename.replace(/\.md$/i, "");
		return stem
			.split(/[-_]+/)
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ") || stem;
	}
}
