export function readEnv(name, { required = true } = {}) {
	const value = String(process.env[name] || '').trim();
	if (required && !value) {
		const error = new Error(`Missing ${name}`);
		error.code = 'MISSING_ENV';
		error.envName = name;
		throw error;
	}
	return value;
}

export function getBaseUrl(req) {
	const proto = (req?.headers?.['x-forwarded-proto'] || req?.headers?.['X-Forwarded-Proto'] || 'https').split(',')[0].trim();
	const host = (req?.headers?.['x-forwarded-host'] || req?.headers?.['X-Forwarded-Host'] || req?.headers?.host || '').split(',')[0].trim();
	if (host) return `${proto}://${host}`;

	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	if (process.env.DOMAIN) return String(process.env.DOMAIN);
	return 'https://tu-tor.vercel.app';
}
