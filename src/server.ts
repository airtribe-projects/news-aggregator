import app from './app';
import { env } from './config/env';
import { refreshTrackedQueries } from './services/news.service';

app.listen(env.port, () => {
    console.log(`Server is listening on ${env.port}`);
}).on('error', (err) => {
    console.error('Something bad happened', err);
    process.exit(1);
});

if (env.cacheRefreshSeconds > 0) {
    const intervalMs = env.cacheRefreshSeconds * 1000;
    setInterval(() => {
        refreshTrackedQueries(intervalMs).catch((err) => console.error('Cache refresh failed', err));
    }, intervalMs).unref();
}
