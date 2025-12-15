export function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

export function applyCors(res) {
	Object.entries(corsHeaders()).forEach(([key, value]) => {
		res.setHeader(key, value);
	});
}
