export const loadEnvFile = async (adapter, projectDir) => {
	const envPath = adapter.join(projectDir, ".env");
	const envExists = await adapter.exists(envPath);

	if (envExists) {
		const envConfig = await adapter.readFile(envPath, "utf-8");
		envConfig.split("\n").forEach((line) => {
			const trimmedLine = line.trim();
			if (trimmedLine && !trimmedLine.startsWith("#")) {
				const separatorIndex = trimmedLine.indexOf("=");
				if (separatorIndex !== -1) {
					const key = trimmedLine.substring(0, separatorIndex).trim();
					let value = trimmedLine.substring(separatorIndex + 1).trim();
					if (
						(value.startsWith('"') && value.endsWith('"')) ||
						(value.startsWith("'") && value.endsWith("'"))
					)
						value = value.substring(1, value.length - 1);
					if (key && !adapter.getEnv(key)) adapter.setEnv(key, value);
				}
			}
		});
	}
};

export const resolveProjectDir = async (adapter, args, fallbackDir) => {
	const currentDir = adapter.getCwd();
	let projectDir = currentDir;
	if (args.length > 0 && !args[0].startsWith("--")) {
		const sourcePath = adapter.resolve(args[0]);
		const pathExists = await adapter.exists(sourcePath);
		if (pathExists) {
			const stats = await adapter.stat(sourcePath);
			if (stats.isDirectory()) projectDir = sourcePath;
		}
	}

	return { projectDir, fallbackDir };
};
