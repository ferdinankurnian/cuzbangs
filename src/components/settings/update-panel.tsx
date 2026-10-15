import { RefreshCw } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	checkForUpdates,
	getAppUpdateState,
	subscribeAppUpdate,
	updateApp,
	type CheckPhase,
} from "@/lib/app-update";

function useAppUpdateState() {
	return useSyncExternalStore(subscribeAppUpdate, getAppUpdateState);
}

type ReleaseInfo = {
	version: string | null;
	notes: string;
};

function useRelease() {
	const [release, setRelease] = useState<ReleaseInfo | null>(null);

	useEffect(() => {
		let cancelled = false;
		fetch(`${import.meta.env.BASE_URL}data/release.json`)
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (!cancelled && data && typeof data === "object") {
					setRelease({
						version: data.version ?? null,
						notes: typeof data.notes === "string" ? data.notes : "",
					});
				}
			})
			.catch(() => {
				// offline or build without notes — hide the section
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return release;
}

async function fetchLatestRelease(): Promise<
	(ReleaseInfo & { tag: string }) | null
> {
	try {
		const res = await fetch(
			"https://api.github.com/repos/ferdinankurnian/cuzbangs/releases/latest",
		);
		if (!res.ok) return null;
		const data = await res.json();
		if (typeof data?.tag_name !== "string") return null;
		return {
			tag: data.tag_name,
			version: data.tag_name,
			notes: typeof data?.body === "string" ? data.body : "",
		};
	} catch {
		return null;
	}
}

export function UpdatePanel() {
	const updateState = useAppUpdateState();
	const release = useRelease();
	const [checkPhase, setCheckPhase] = useState<CheckPhase | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleCheckForUpdates = async () => {
		setCheckPhase("checking");
		try {
			const [state, latest] = await Promise.all([
				checkForUpdates((phase) => setCheckPhase(phase)),
				fetchLatestRelease(),
			]);
			const isNewRelease =
				latest !== null && latest.tag !== __APP_VERSION__;
			if (state.needRefresh) {
				toast("Update available", {
					description:
						isNewRelease && latest
							? `${latest.tag} is ready to install.`
							: "A new version of cuzbangs is ready to install.",
				});
			} else if (isNewRelease && latest) {
				toast("Update on the way", {
					description: `${latest.tag} was just released and is still deploying — try again in a minute.`,
				});
			} else {
				toast("You're up to date", {
					description: `cuzbangs ${__APP_VERSION__} is the latest version.`,
				});
			}
		} catch {
			toast.error("Couldn't check for updates", {
				description: "Check your connection and try again.",
			});
		} finally {
			setCheckPhase(null);
		}
	};

	const handleUpdate = async () => {
		setIsUpdating(true);
		try {
			// always ends in a reload (or an early return when nothing is pending)
			await updateApp();
		} catch {
			toast.error("Couldn't apply the update", {
				description: "Reload the page and try again.",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<section className="w-full space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Update</CardTitle>
					<CardDescription>
						cuzbangs works offline and updates through the app itself
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							<p className="font-medium">{__APP_VERSION__}</p>
							<p className="text-sm text-muted-foreground">
								{updateState.needRefresh
									? "A new version is ready to install"
									: "You're on the latest version"}
							</p>
						</div>
						<div className="flex shrink-0 gap-2">
							{updateState.needRefresh ? (
								<Button
									onClick={() => void handleUpdate()}
									disabled={isUpdating}
								>
									<RefreshCw
										className={isUpdating ? "animate-spin" : undefined}
									/>
									{isUpdating ? "Updating" : "Update now"}
								</Button>
							) : null}
							<Button
								variant="outline"
								onClick={() => void handleCheckForUpdates()}
								disabled={checkPhase !== null}
							>
								<RefreshCw
									className={checkPhase !== null ? "animate-spin" : undefined}
								/>
								{checkPhase === "downloading"
									? "Downloading update"
									: checkPhase === "checking"
										? "Checking"
										: "Check for updates"}
							</Button>
						</div>
					</div>
					{updateState.needRefresh ? (
						<>
							<Separator />
							<p className="text-sm text-muted-foreground">
								After updating, your browser's custom search engine (the /go
								URL) will use the new version in every new tab too.
							</p>
						</>
					) : null}
				</CardContent>
			</Card>

			{release && release.notes ? (
				<Card>
					<CardHeader>
						<CardTitle>What's new</CardTitle>
						<CardDescription>
							{release.version
								? `Changes in ${release.version}`
								: "Recent changes to cuzbangs"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm leading-relaxed whitespace-pre-wrap">
							{release.notes}
						</p>
					</CardContent>
				</Card>
			) : null}
		</section>
	);
}
