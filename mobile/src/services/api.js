const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

let token = null;

export function setToken(value){ token = value; }
export function getToken(){ return token; }

export async function api(path, options={}) {
  const headers = {...(options.headers||{})};
  if(token) headers.Authorization = `Bearer ${token}`;
  if(options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}${path}`, {...options,headers});
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {message:text}; }
  if(!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
