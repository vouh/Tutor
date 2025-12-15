import axios from 'axios';
import { corsHeaders as coreCorsHeaders } from '../_core/cors.js';
import { readEnv } from '../_core/env.js';

const url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

export async function getAccessToken() {
	const CONSUMER_KEY = readEnv('CONSUMER_KEY');
	const CONSUMER_SECRET = readEnv('CONSUMER_SECRET');

	const result = await axios.get(url, {
		auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET },
		headers: { Accept: 'application/json' },
	});

	return result.data.access_token;
}

export function getTimeStamp() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function corsHeaders() {
	return coreCorsHeaders();
}
