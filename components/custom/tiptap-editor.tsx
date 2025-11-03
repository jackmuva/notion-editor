"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEditorStore } from '@/store/editorStore'
import { useEffect } from 'react';
import { Markdown } from '@tiptap/markdown'
import useParagon from '@/hooks/useParagon';
import { PageCommand } from './page-command';
import { EditorBubbleMenu } from './editor-bubble-menu';

//TODO: Loading states needed
export const TiptapEditor = ({
	paragonToken
}: {
	paragonToken: string
}) => {
	const { user } = useParagon(paragonToken);
	const queryClient = useQueryClient();
	const { selectedPageId } = useEditorStore((state) => state);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [StarterKit, Markdown],
		content: '## New Page',
		contentType: "markdown",
	});


	const query = useQuery<{ markdownContent: string } | null>({
		queryKey: ['page-content'], queryFn: async () => {
			if (user.authenticated && !user.integrations.notion?.enabled) {
				return { markdownContent: "" };
			}
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
		}
	});

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
	})

	useEffect(() => {
		if (editor && query.data?.markdownContent) {
			editor.commands.setContent(query.data?.markdownContent, {
				contentType: "markdown",
			});
		}
	}, [editor, query.data])

	useEffect(() => {
		mutation.mutate();
	}, [selectedPageId])

	return (
		<div className='w-full h-full flex flex-col justify-center items-center relative'>
			{editor && <>
				<PageCommand paragonToken={paragonToken} editor={editor} />
				<EditorContent className='md:ml-60 ProseMirror w-full max-w-[750px] h-5/6 overflow-y-auto no-scrollbar'
					editor={editor} />
				<EditorBubbleMenu editor={editor} />
			</>}
		</div>
	)
}
