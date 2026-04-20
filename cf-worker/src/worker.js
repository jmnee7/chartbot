async function dispatchWorkflow(env) {
    const url = `https://api.github.com/repos/${env.OWNER}/${env.REPO}/actions/workflows/${env.WORKFLOW_FILE}/dispatches`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'User-Agent': 'chartbot-trigger-worker',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: env.REF })
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`dispatch failed: ${resp.status} ${text}`);
    }
    return resp.status;
}

export default {
    async scheduled(event, env, ctx) {
        const status = await dispatchWorkflow(env);
        console.log(`[${new Date().toISOString()}] dispatched ${env.WORKFLOW_FILE} -> ${status}`);
    },
    async fetch(req, env, ctx) {
        const url = new URL(req.url);
        if (url.pathname === '/trigger') {
            const secret = req.headers.get('x-trigger-secret') || url.searchParams.get('secret');
            if (!env.TRIGGER_SECRET || secret !== env.TRIGGER_SECRET) {
                return new Response('unauthorized', { status: 401 });
            }
            try {
                const status = await dispatchWorkflow(env);
                return new Response(`ok ${status}`, { status: 200 });
            } catch (e) {
                return new Response(String(e), { status: 500 });
            }
        }
        return new Response('chartbot-trigger worker', { status: 200 });
    }
};
