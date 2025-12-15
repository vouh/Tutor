export function json(res, status, body) {
	return res.status(status).json(body);
}

export function ok(res, body) {
	return json(res, 200, body);
}

export function methodNotAllowed(res) {
	return json(res, 405, { success: false, message: 'Method not allowed' });
}

export function badRequest(res, message) {
	return json(res, 400, { success: false, message });
}

export function serverError(res, message = 'Server error') {
	return json(res, 500, { success: false, message });
}
