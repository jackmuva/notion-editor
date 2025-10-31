"use server";
import Image from "next/image";
import { cookies } from 'next/headers'
import { SidebarContainer } from "@/components/custom/sidebar-container";

export default async function Home() {
	const paragonToken: string = (await cookies()).get("paragonToken")?.value ?? "";

	return (
		<div>
			<SidebarContainer paragonToken={paragonToken} />
		</div>
	);
}
