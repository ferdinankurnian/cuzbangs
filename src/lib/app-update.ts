import { registerSW } from "virtual:pwa-register";

export type AppUpdateState = {
	needRefresh: boolean;
	offlineReady: boolean;
};

type Listener = (state: AppUpdateState) => void;

let state: AppUpdateState = { needRefresh: false, offlineReady: false };
let updateService: (reloadPage?: boolean) => Promise<void> = async () => {};
const listeners = new Set<Listener>();

function setState(next: Partial<AppUpdateState>) {
	state = { ...state, ...next };
	for (const listener of listeners) listener(state);
}

export function setupAppUpdate() {
	updateService = registerSW({
		immediate: true,
		onNeedRefresh() {
			setState({ needRefresh: true });
		},
		onOfflineReady() {
			setState({ offlineReady: true });
		},
	});
}

export function getAppUpdateState(): AppUpdateState {
	return state;
}

export function subscribeAppUpdate(listener: Listener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export async function updateApp(waitTimeoutMs = 8000): Promise<void> {
	const registration = await navigator.serviceWorker.getRegistration();
	const waiting = registration?.waiting;
	if (!state.needRefresh && !waiting) return;

	// reload is only triggered by workbox's "controlling" event, which never
	// fires when the message reaches no waiting worker. so instead: nudge the
	// worker, wait for the takeover (or time out), then reload ourselves.
	const controlled = new Promise<void>((resolve) => {
		const cleanup = () => {
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				onControllerChange,
			);
			clearTimeout(timer);
		};
		const onControllerChange = () => {
			cleanup();
			resolve();
		};
		const timer = setTimeout(() => {
			cleanup();
			resolve();
		}, waitTimeoutMs);
		navigator.serviceWorker.addEventListener(
			"controllerchange",
			onControllerChange,
		);
	});

	// nudge directly (belt) and through workbox (suspenders)
	waiting?.postMessage({ type: "SKIP_WAITING" });
	await updateService(false).catch(() => undefined);

	await controlled;
	window.location.reload();
}

export type CheckPhase = "checking" | "downloading";

function waitForInstalled(
	worker: ServiceWorker,
	timeoutMs: number,
): Promise<boolean> {
	return new Promise((resolve) => {
		if (worker.state === "installed") {
			resolve(true);
			return;
		}
		if (worker.state === "redundant") {
			resolve(false);
			return;
		}
		const timer = setTimeout(() => {
			worker.removeEventListener("statechange", onChange);
			resolve(worker.state === "installed");
		}, timeoutMs);
		const onChange = () => {
			if (worker.state === "installed" || worker.state === "redundant") {
				clearTimeout(timer);
				worker.removeEventListener("statechange", onChange);
				resolve(worker.state === "installed");
			}
		};
		worker.addEventListener("statechange", onChange);
	});
}

function waitForInstalling(
	registration: ServiceWorkerRegistration,
	timeoutMs: number,
): Promise<ServiceWorker | null> {
	if (registration.installing) return Promise.resolve(registration.installing);
	return new Promise((resolve) => {
		let done = false;
		const timer = setTimeout(() => {
			if (!done) {
				done = true;
				resolve(registration.installing);
			}
		}, timeoutMs);
		registration.addEventListener(
			"updatefound",
			() => {
				if (!done) {
					done = true;
					clearTimeout(timer);
					resolve(registration.installing);
				}
			},
			{ once: true },
		);
	});
}

export async function checkForUpdates(
	onPhase?: (phase: CheckPhase) => void,
	timeoutMs = 60_000,
): Promise<AppUpdateState> {
	const registration = await navigator.serviceWorker.getRegistration();
	if (!registration) return state;
	if (registration.waiting) {
		setState({ needRefresh: true });
		return state;
	}

	onPhase?.("checking");
	await registration.update();

	if (state.needRefresh || registration.waiting) {
		setState({ needRefresh: true });
		return state;
	}

	// update() resolved but install may start a tick later - watch for it
	const installing = await waitForInstalling(registration, 2000);
	if (!installing) return state;

	onPhase?.("downloading");
	const installed = await waitForInstalled(installing, timeoutMs);
	if (installed || registration.waiting) setState({ needRefresh: true });
	return state;
}
