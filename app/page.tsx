"use server";
import { cookies } from 'next/headers'
import { SidebarContainer } from "@/components/custom/sidebar-container";
import { TiptapEditor } from "@/components/custom/tiptap-editor";

export default async function Home() {
	const paragonToken: string = (await cookies()).get("paragonToken")?.value ?? "";

	return (
		<div className="w-dvw h-dvh">
			<SidebarContainer paragonToken={paragonToken} />
			<TiptapEditor paragonToken={paragonToken} />
		</div>
	);
}
