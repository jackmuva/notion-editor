"use client";
import { useCallback, useEffect, useState } from "react";
import { paragon, SDK_EVENT } from "@useparagon/connect";

if (typeof window !== "undefined") {
	//@ts-expect-error window may not have paragon prop
	window.paragon = paragon;
}

export default function useParagon(paragonUserToken: string) {
	const [user, setUser] = useState(() => {
		if (typeof window !== "undefined") {
			return paragon.getUser();
		}
		return { authenticated: undefined, integrations: {} };
	});
	const [error, setError] = useState();

	const updateUser = useCallback(() => {
		if (typeof window !== "undefined") {
			const authedUser = paragon.getUser();
			if (authedUser.authenticated) {
				setUser({ ...authedUser });
			}
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;

		paragon.subscribe(SDK_EVENT.ON_INTEGRATION_INSTALL, updateUser);
		//@ts-expect-error paragon sdk
		paragon.subscribe("onIntegrationUninstall", updateUser);
		return () => {
			//@ts-expect-error paragon sdk
			paragon.unsubscribe("onIntegrationInstall", updateUser);
			//@ts-expect-error paragon sdk
			paragon.unsubscribe("onIntegrationUninstall", updateUser);
		};
	}, [updateUser]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!error && paragonUserToken) {
			console.log("paragon authenticating...")
			paragon.authenticate(
				process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!,
				paragonUserToken
			).then(() => {
				console.log("setting user...")
				const authedUser = paragon.getUser();
				if (authedUser.authenticated) {
					setUser(authedUser);
				}
			}).catch((err) => {
				console.error("Paragon authentication failed:", err);
				setError(err);
			});
		}
	}, [error, paragonUserToken]);

	return {
		paragon,
		user,
		error,
		updateUser,
	};
}
