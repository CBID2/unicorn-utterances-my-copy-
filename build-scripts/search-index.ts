import Fuse from "fuse.js";
import { getAllPosts } from "../src/utils/get-all-posts";

import * as fs from "fs";
import * as path from "path";

const posts = getAllPosts("en");

export const createIndex = async () => {
	return Fuse.createIndex(
		[
			{
				name: "title",
				weight: 2,
			},
			{
				name: "authorName",
				getFn: (post) => {
					return (post as any).authorsMeta
						.map((author) => author.name)
						.join(", ");
				},
				weight: 1.8,
			},
			{
				name: "authorHandles",
				getFn: (post) => {
					return (post as any).authorsMeta
						.flatMap((author) => Object.values(author.socials))
						.join(", ");
				},
				weight: 1.2,
			},
			{ name: "tags", weight: 1.5, getFn: (post) => post.tags.join(", ") },
			{ name: "description", weight: 1.2 },
			{ name: "excerpt", weight: 1.2 },
		],
		posts
	).toJSON();
};

createIndex().then((index) => {
	const json = JSON.stringify({ index, posts });
	fs.writeFileSync(path.resolve(process.cwd(), "./api/searchIndex.json"), json);
});
