```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[Discord Interaction Endpoint 用の公開鍵を設定]

`DISCORD_PUBLIC_KEY` は `wrangler.jsonc` の `vars` で管理します。

1. `wrangler.jsonc` の `vars.DISCORD_PUBLIC_KEY` に値を設定
2. ローカル実行: `npm run dev`
3. デプロイ: `npm run deploy`

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
