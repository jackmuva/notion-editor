import { useEditorStore } from "@/store/editorStore";
import { Button } from "../ui/button";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Editor } from "@tiptap/react";
import { useState } from "react";

export const PageCommand = ({
	paragonToken,
	editor,
	refetchContent,
}: {
	paragonToken: string,
	editor: Editor,
	refetchContent: () => Promise<any>,
}) => {
	const { selectedPageId } = useEditorStore((state) => state);
	const [pushing, setPushing] = useState<boolean>(false);

	const pushChanges = async () => {
		setPushing(true);
		setTimeout(() => {
			setPushing(false);
		}, 7 * 1000)
		await fetch(`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				"Authorization": `Bearer ${paragonToken}`
			},
			body: JSON.stringify({
				action: "NOTION_UPDATE_PAGE_WITH_MARKDOWN",
				parameters: {
					pageId: selectedPageId,
					markdownContent: editor.getMarkdown(),
					replaceExisting: true,
				}
			}),
		});
	}

	return (
		<div className="absolute top-0 right-0 p-4 flex space-x-2">
			<Button variant={"outline"} size={"sm"}
				onClick={() => {
					refetchContent();
				}}>
				<ArrowDownToLine size={10} />
				Pull Notion Updates
			</Button>
			<Button variant={"outline"} size={"sm"}
				onClick={() => pushChanges()}
				className={`${pushing ? "hover:bg-indigo-200 bg-indigo-300" : ""}`}>
				<ArrowUpFromLine size={10} />
				{pushing ? "Pushing Changes..." : "Push Editor Changes"}
			</Button>
		</div>
	);
}
