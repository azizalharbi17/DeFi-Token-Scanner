
export class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

export const apiFetch = async <T,>(url: string, options: RequestInit = {}, retries = 3, backoff = 300): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                let errorBody;
                try {
                    errorBody = await response.json();
                } catch (e) {
                    errorBody = await response.text();
                }
                const errorMessage = typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody
                    ? (errorBody as any).message
                    : JSON.stringify(errorBody);
                throw new ApiError(`API request failed with status ${response.status}: ${errorMessage}`, response.status);
            }

            // Handle cases where API returns success but empty body for methods that expect JSON
            const text = await response.text();
            if (!text) {
                return null as T;
            }
            return JSON.parse(text) as T;

        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, backoff * (i + 1)));
        }
    }
    throw new Error('API request failed after multiple retries.');
};

// Simple concurrency limiter
export async function pLimit<T>(limit: number, tasks: (() => Promise<T>)[]) {
  const results: T[] = [];
  const active: Promise<void>[] = [];
  let currentIndex = 0;

  const execute = async () => {
    if (currentIndex >= tasks.length) return;
    const taskIndex = currentIndex++;
    const task = tasks[taskIndex];
    
    const promise = task().then(result => {
      results[taskIndex] = result;
    });

    active.push(promise);
    await promise;
    active.splice(active.indexOf(promise), 1);
  };

  while (currentIndex < tasks.length) {
    while (active.length < limit && currentIndex < tasks.length) {
      execute();
    }
    await Promise.race(active);
  }

  await Promise.all(active);
  return results;
}
