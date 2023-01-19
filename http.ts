import got, { CancelableRequest, Options, Response } from 'got';
import tc from 'tough-cookie';
var cookieJar = new tc.CookieJar();
export const get = async (url:string,headers:object={},opts:object={}):Promise<CancelableRequest<any>|Error>=>{
	let defaultHeaders = {
		'user-agent': "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/537.0.0 (KHTML, like Gecko) Chrome/36.0.856.0 Safari/537.0.0",
		...headers
	};
	let defaultOpts = {
		cookieJar: cookieJar,
		headers: defaultHeaders,
		timeout: {
			lookup: 1000,
			connect: 5000,
			secureConnect: 5000,
			socket: 10000,
			send: 20000,
			response: 20000
		},
		...opts
	};
	try {
		let result = await got.get(url,defaultOpts);
		return result;
	} catch (e) {
		throw new Error(e);
	}
};
export const post = async (url:string,body:object,headers:object={},opts:object={},asForm:boolean=false):Promise<CancelableRequest<any>|Error>=>{
	let defaultHeaders = {
		'user-agent': "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/537.0.0 (KHTML, like Gecko) Chrome/36.0.856.0 Safari/537.0.0",
		...headers
	};
	if(!asForm)
		defaultHeaders["Content-Type"] = "application/json";
	let defaultOpts = new Options({
		cookieJar: cookieJar,
		headers: defaultHeaders,
		body: asForm ? undefined : JSON.stringify(body),
		form: asForm ? body : undefined,
		timeout: {
			lookup: 1000,
			connect: 5000,
			secureConnect: 5000,
			socket: 10000,
			send: 20000,
			response: 20000
		},
		...opts
	});
	try {
		let result = await got.post(url,defaultOpts);
		return result;
	} catch (e) {
		throw new Error(e);
	}
};
export const patch = async (url:string,body:object,headers:object={},opts:object={}):Promise<CancelableRequest<any>|Error>=>{
	let defaultHeaders = {
		'user-agent': "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/537.0.0 (KHTML, like Gecko) Chrome/36.0.856.0 Safari/537.0.0",
		'content-type': 'application/json',
		...headers
	};
	let defaultOpts = new Options({
		cookieJar: cookieJar,
		headers: defaultHeaders,
		body: JSON.stringify(body),
		timeout: {
			lookup: 1000,
			connect: 5000,
			secureConnect: 5000,
			socket: 10000,
			send: 20000,
			response: 20000
		},
		...opts
	});
	try {
		let result = await got.patch(url,defaultOpts);
		return result;
	} catch (e) {
		throw new Error(e);
	}
};
export const put = async (url:string,file:Buffer,headers:object={},opts:object={}):Promise<CancelableRequest<any>|Error>=>{
	let defaultHeaders = {
		'user-agent': "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/537.0.0 (KHTML, like Gecko) Chrome/36.0.856.0 Safari/537.0.0",
		...headers
	};
	let defaultOpts = new Options({
		cookieJar: cookieJar,
		headers: defaultHeaders,
		body: file,
		timeout: {
			lookup: 1000,
			connect: 5000,
			secureConnect: 5000,
			socket: 10000,
			send: 20000,
			response: 20000
		},
		...opts
	});
	try {
		let result = await got.put(url,defaultOpts);
		return result;
	} catch (e) {
		throw new Error(e);
	}
}