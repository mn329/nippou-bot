```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[Discord Interaction Endpoint 用の公開鍵を設定]

このプロジェクトでは `.env.vars` で環境変数を管理します。

1. プロジェクト直下に `.env.vars` を作成
2. 次の形式で値を設定

```txt
DISCORD_PUBLIC_KEY=YOUR_DISCORD_PUBLIC_KEY
```

3. ローカル実行: `npm run dev`
4. デプロイ: `npm run deploy`

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
