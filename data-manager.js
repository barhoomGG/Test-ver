// data-manager.js
const WORKER_URL = 'https://ibraheem.golden33191.workers.dev';

const ALLOWED_FILES = ['anime-a.json', 'anime-recent.json'];
const NOTIFICATION_FILE = 'notifications.json';

const inFlightRequests = new Map();
const TTL = 60000; // 1 minute

async function fetchData(file) {
  if (!ALLOWED_FILES.includes(file) && file !== NOTIFICATION_FILE) {
    throw new Error('Invalid file');
  }

  const url = `${WORKER_URL}/data?file=${file}`;
  const storageKey = `panda-cine-data-${file}`;
  const etagKey = `panda-cine-etag-${file}`;
  const timestampKey = `panda-cine-timestamp-${file}`;

  const cachedData = localStorage.getItem(storageKey);
  const cachedEtag = localStorage.getItem(etagKey);
  const cachedTimestamp = localStorage.getItem(timestampKey);

  if (cachedData && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < TTL)) {
    return JSON.parse(cachedData);
  }

  if (cachedData && cachedEtag) {
    const response = await conditionalFetch(url, cachedEtag);
    if (response.status === 304) {
      localStorage.setItem(timestampKey, Date.now().toString());
      return JSON.parse(cachedData);
    } else if (response.ok) {
      const data = await response.json();
      const newEtag = response.headers.get('ETag');
      localStorage.setItem(storageKey, JSON.stringify(data));
      if (newEtag) localStorage.setItem(etagKey, newEtag);
      localStorage.setItem(timestampKey, Date.now().toString());
      return data;
    }
  }

  const response = await conditionalFetch(url, null);
  if (response.ok) {
    const data = await response.json();
    const newEtag = response.headers.get('ETag');
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (newEtag) localStorage.setItem(etagKey, newEtag);
    localStorage.setItem(timestampKey, Date.now().toString());
    return data;
  }

  throw new Error('Failed to fetch data');
}

async function conditionalFetch(url, etag) {
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const headers = {};
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const promise = fetch(url, { headers });
  inFlightRequests.set(url, promise);

  try {
    const response = await promise;
    return response;
  } finally {
    inFlightRequests.delete(url);
  }
}

const DataManager = {
  async getAnimeList() {
    try {
      const fetchPromises = ALLOWED_FILES.map(file => fetchData(file));
      const results = await Promise.all(fetchPromises);
      const allAnimeData = results.flat();
      return { data: allAnimeData };
    } catch (error) {
      console.error('Error fetching anime list:', error);
      throw error;
    }
  },
  async getNotifications() {
    try {
      const data = await fetchData(NOTIFICATION_FILE);
      return { data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
};

export default DataManager;