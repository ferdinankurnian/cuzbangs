import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "cuzbangs-v2",
		compatibilityDate: "2026-01-04",
		entrypoint: "src/worker.ts",
		observability: {
			enabled: false,
			logs: {
				enabled: true,
				headSamplingRate: 1,
				persist: true,
				invocationLogs: true,
			},
		},
		env: {
			ASSETS: bindings.assets(),
		},
	},
});
