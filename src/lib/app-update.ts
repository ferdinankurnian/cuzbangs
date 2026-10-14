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

export async function updateApp(): Promise<void> {
	if (!state.needRefresh) return;
	await updateService(true);
}

export async function checkForUpdates(): Promise<AppUpdateState> {
	const registration = await navigator.serviceWorker.getRegistration();
	if (!registration) return state;

	await registration.update();

	const deadline = Date.now() + 3000;
	while (!state.needRefresh && Date.now() < deadline) {
		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	return state;
}
