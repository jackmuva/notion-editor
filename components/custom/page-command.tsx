import { useEditorStore } from "@/store/editorStore";
import { Button } from "../ui/button";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tiptap/react";

export const PageCommand = ({
	paragonToken,
	editor,
}: {
	paragonToken: string,
	editor: Editor,
}) => {
	const { selectedPageId } = useEditorStore((state) => state);
	const queryClient = useQueryClient();

	const mutation = useMutation<{ markdownContent: string } | null>({
		mutationFn: async () => {
			if (selectedPageId) {
				const req = await fetch(`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`, {
					method: "POST",
					headers: {
						"Content-type": "application/json",
						"Authorization": `Bearer ${paragonToken}`
					},
					body: JSON.stringify({
						action: "NOTION_GET_PAGE_AS_MARKDOWN",
						parameters: {
							pageId: selectedPageId
						}
					}),
				});
				return await req.json();
			} else {
				return null;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['page-content'] })
		},
	});

	const pushChanges = async () => {
		const req = await fetch(`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`, {
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
		const res = await req.json();
		console.log("pushed: ", res);
	}

	return (
		<div className="absolute top-0 right-0 p-4 flex space-x-2">
			<Button variant={"outline"} size={"sm"}
				onClick={() => mutation.mutate()}>
				<ArrowDownToLine size={10} />
				Pull Notion Updates
			</Button>
			<Button variant={"outline"} size={"sm"}
				onClick={() => pushChanges()} >
				<ArrowUpFromLine size={10} />
				Push Editor Changes
			</Button>
		</div>
	);
}
