self.onmessage = async (event) => {
  const { depths, hardcodedTime, apiBaseUrl } = event.data;
  const cache = {};

  try {
    for (const depth of depths) {
      const url = `${apiBaseUrl}/data/${encodeURIComponent(hardcodedTime)}/${depth}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const cacheKey = `${hardcodedTime}_${depth}`;
        cache[cacheKey] = data;
        // Optionally, send a message back after each successful fetch
        // self.postMessage({ type: 'progress', depth, status: 'complete' });
      } else {
        console.error(`Failed to fetch data for depth ${depth}m with status: ${response.status}`);
      }
    }
    // Send the final, complete cache back to the main thread
    self.postMessage({ type: 'complete', cache });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};