"use client";

import useParagon from "@/hooks/useParagon";
import { Sidebar, SidebarContent, SidebarGroup, useSidebar } from "@/components/ui/sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { ScrollText } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

export type NotionPage = {
	id: string,
	url: string,
	properties: {
		title: {
			id: string,
			type: string,
			title: Array<{
				plain_text: string
			}>
		}
	}
}

export const SidebarContainer = ({
	paragonToken
}: {
	paragonToken: string
}) => {
	const { paragon, user } = useParagon(paragonToken);
	const queryClient = useQueryClient();
	const { selectedPageId, setSelectedPageId } = useEditorStore((state) => state);

	useEffect(() => {
		if (user.authenticated && !user.integrations.notion?.enabled) {
			paragon.connect("notion", {});
		} else {
			mutation.mutate();
		}
	}, [user, paragon]);

	const query = useQuery<NotionPage[]>({
		queryKey: ['notion-pages'], queryFn: async () => {
			const req = await fetch(`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`, {
				method: "POST",
				headers: {
					"Content-type": "application/json",
					"Authorization": `Bearer ${paragonToken}`
				},
				body: JSON.stringify({
					action: "NOTION_SEARCH_PAGES",
					parameters: {}
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
					action: "NOTION_SEARCH_PAGES",
					parameters: {}
				}),
			});
			return await req.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notion-pages'] })
		},
	})

	return (
		<Sidebar>
			<SidebarContent>
				<h1 className="ml-2 mt-2 font-bold text-lg italic">
					NotionEditor
				</h1>
				{user.authenticated && !user.integrations.notion?.enabled ? (
					<div className="w-full h-full flex justify-center items-center">
						<Button className="w-fit"
							onClick={() => paragon.connect("notion", {})}>
							Connect Notion
						</Button>
					</div>
				) : (
					<SidebarGroup>
						<div className="ml-2">
							{query.data?.map((page) => {
								return (
									<div key={page.id}
										className={`flex space-x-1 items-center px-1 
											rounded-xs cursor-pointer
											${page.id === selectedPageId ? "bg-foreground/20"
												: "hover:bg-foreground/10"}`}
										onClick={() => {
											setSelectedPageId(page.id);
										}}>
										<ScrollText size={15} />
										<div className="line-clamp-1 w-fit">
											{page.properties.title.title[0].plain_text}
										</div>
									</div>
								)
							})}
						</div>
					</SidebarGroup>

				)}
			</SidebarContent>
		</Sidebar>
	);
}
