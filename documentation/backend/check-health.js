const url = process.env.URL || 'http://localhost:5001/api/health';

(async () => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Health response:', data);
  } catch (err) {
    console.error('Health check failed:', err.message);
    process.exit(1);
  }
})();