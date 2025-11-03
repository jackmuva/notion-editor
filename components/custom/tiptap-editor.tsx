"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useQuery } from '@tanstack/react-query'
import { useEditorStore } from '@/store/editorStore'
import { useEffect } from 'react';
import { Markdown } from '@tiptap/markdown'
import useParagon from '@/hooks/useParagon';
import { PageCommand } from './page-command';
import { EditorBubbleMenu } from './editor-bubble-menu';

const LoadingSkeleton = () => {
	const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3', 'w-3/5', 'w-1/2'];

	return (
		<div className='flex flex-col space-y-4 p-4'>
			{Array(7).fill(0).map((_, index) => {
				const randomWidth = widths[Math.floor(Math.random() * widths.length)];
				return (
					<div
						key={index}
						className={`${randomWidth} h-6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse`}
					/>
				)
			})}
		</div>
	);
}

export const TiptapEditor = ({
	paragonToken
}: {
	paragonToken: string
}) => {
	const { user } = useParagon(paragonToken);
	const { selectedPageId } = useEditorStore((state) => state);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [StarterKit, Markdown],
		contentType: "markdown",
	});


	const query = useQuery<{ markdownContent: string } | null>({
		queryKey: ['page-content', selectedPageId],
		queryFn: async () => {
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
				const res = await req.json();
				if (!res || Object.keys(res).length === 0) {
					return { markdownContent: "This page has no markdown text; perhaps it is just a page with links" }
				} else {
					return res;
				}
			} else {
				return null;
			}
		},
		enabled: !!selectedPageId && !!user.authenticated,
		refetchOnMount: true,
		refetchOnWindowFocus: false
	});

	useEffect(() => {
		if (editor && query.data?.markdownContent) {
			const newContent = query.data.markdownContent;

			editor.commands.setContent(newContent, {
				contentType: "markdown",
			});
		}
	}, [editor, query.data, query.dataUpdatedAt])

	if (query.isRefetching || query.isLoading || !query.data) {
		return (
			<div className='w-full h-full flex flex-col justify-center items-center relative'>
				<div className='md:ml-60 ProseMirror w-full max-w-[750px] h-5/6 overflow-y-auto no-scrollbar'>
					<LoadingSkeleton />
				</div>
			</div>
		);
	}

	return (
		<div className='w-full h-full flex flex-col justify-center items-center relative'>
			{editor && <>
				<PageCommand paragonToken={paragonToken} editor={editor} refetchContent={query.refetch} />
				<EditorContent className='md:ml-60 ProseMirror w-full max-w-[750px] h-5/6 overflow-y-auto no-scrollbar'
					editor={editor} />
				<EditorBubbleMenu editor={editor} />
			</>}
		</div>
	)
}
