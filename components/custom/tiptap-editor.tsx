"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEditorStore } from '@/store/editorStore'

export const TiptapEditor = ({
	paragonToken
}: {
	paragonToken: string
}) => {
	const queryClient = useQueryClient();
	const { selectedPageId } = useEditorStore((state) => state);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [StarterKit],
		content: '<p>Hello World!</p>',
	});

	const query = useQuery({
		queryKey: ['page-content'], queryFn: async () => {
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
		}
	});

	const mutation = useMutation({
		mutationFn: async () => {
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
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['page-content'] })
		},
	})

	console.log(query.data);


	return (
		<div className='w-full h-full flex flex-col justify-center items-center'>
			{editor && <>
				<EditorContent className='w-1/2 h-3/4 border'
					editor={editor} />
				<FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
				<BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
			</>}
		</div>
	)
}
