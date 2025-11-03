"use client";

import useParagon from "@/hooks/useParagon";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { StickyNote } from "lucide-react";
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
	const [isClient, setIsClient] = useState(false);

	const query = useQuery<NotionPage[]>({
		queryKey: ['notion-pages'], queryFn: async () => {
			if (user.authenticated && !user.integrations.notion?.enabled) {
				return [];
			}
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
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['notion-pages'] });
			if (query.data) {
				setSelectedPageId(query.data[query.data.length - 1].id)
			}
		},
	})

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !isClient) return;
		if (user.authenticated === undefined) return;
		if (user.authenticated && !user.integrations.notion?.enabled) {
			try {
				paragon.connect("notion", {});
			} catch (e) {
				console.error("failed to connect notion: ", e);
			}
		} else {
			mutation.mutate();

		}
	}, [user, paragon, isClient]);

	if (!isClient) {
		return (
			<Sidebar>
				<SidebarContent>
					<h1 className="ml-2 mt-2 font-bold text-lg italic">
						NotionEditor
					</h1>
					<div className="w-full h-full flex justify-center items-center">
						<div>Loading...</div>
					</div>
				</SidebarContent>
			</Sidebar>
		);
	}
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
										<StickyNote size={15} />
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
