# chartbot-trigger (Cloudflare Worker)

매 시간 정각 GitHub Actions `crawl-charts.yml` 를 `workflow_dispatch` API 로 트리거.

## 왜 CF Worker?

GitHub Actions 의 `schedule:` cron 은 러너 부하에 따라 5~40분 지연이 흔함.
CF Workers Cron 은 jitter 가 수십초 수준이고 GitHub dispatch API 는 즉시 큐잉 → 훨씬 정각에 가깝게 돌아감.

## 배포

```bash
cd cf-worker
npm i -g wrangler            # 또는 npx wrangler
wrangler login               # Cloudflare 계정 로그인 (브라우저)

# GitHub PAT 발급 후 (fine-grained, actions:write on jmnee7/chartbot)
wrangler secret put GITHUB_TOKEN

# (선택) /trigger HTTP 엔드포인트 보호용 shared secret
wrangler secret put TRIGGER_SECRET

wrangler deploy
```

## 수동 트리거 (디버그)

```bash
curl -H "x-trigger-secret: <TRIGGER_SECRET>" \
    https://chartbot-trigger.<your-subdomain>.workers.dev/trigger
```

## GHA schedule 비활성화

중복 실행 방지를 위해 `.github/workflows/crawl-charts.yml` 의 다음 블록을 주석 처리:

```yaml
# schedule:
#   - cron: '0 15-23,0-14 * * *'
```

`push` / `workflow_dispatch` 트리거는 유지.
