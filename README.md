# VRChat World Memory

VRChatのワールド情報を記録するWebアプリケーションです。  
入力したVRChatのWorld URLからワールド名、説明、タグを自動で取得し、必要に応じて編集可能です。

## 目次
- [.env設定](#env設定)
- [GitHub OAuth](#github-oauth)
- [Discord OAuth](#discord-oauth)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [参考情報](#参考情報)

## .env設定

### 開発環境
```env
GITHUB_ID=ClientID
GITHUB_SECRET=ClientSecrets

DISCORD_CLIENT_ID=ClientID
DISCORD_CLIENT_SECRET=ClientSecret

NEXTAUTH_URL=http://localhost:3000/
CALLBACK=http://localhost:3000/api/auth/callback/github
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOSTNAME:5432/DATABASE
```

### 本番環境
```env
GITHUB_ID=ClientID
GITHUB_SECRET=ClientSecrets

DISCORD_CLIENT_ID=ClientID
DISCORD_CLIENT_SECRET=ClientSecret

NEXTAUTH_URL=https://example.com/
CALLBACK=https://example.com/api/auth/callback/github
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE
```

## GitHub OAuth

1. GitHubの[OAuth Apps](https://github.com/settings/developers)へアクセス  
2. `NEW OAuth Apps`をクリックし必須項目を入力  
3. `Authorization callback URL`には.envのCALLBACKと同じURLを設定

![GitHub OAuth Sample](image/GitHub-OAuth1.png)

**General**にある`Client ID`の値と`Client secrets`の値を.envに入れる
![GitHub Value](image/GitHub-OAuth2.png)

## Discord OAuth

1. [DiscordのDevelopers](https://discord.com/developers/applications/)より`New Application`を作成  
2. 任意の名前を設定し、チェックボックスを有効にする  
3. OAuth2 > Redirects で以下のURLを追加  
   - ポート指定あり: `http://{HOSTNAME:PORT}/api/auth/callback/discord`
   - ポート指定なし: `http://{HOSTNAME}/api/auth/callback/discord`
4. 設定後、Save Changesをクリック

![Discord OAuth Sample](image/Discord-OAuth1.png)
![Discord OAuth Sample](image/Discord-OAuth2.png)

**OAuth2**の**Client information**にある`Client ID`と`Client Secret`の値を.envに入れる。
![Discord Value](image/Discord-OAuth3.png)

## 開発環境のセットアップ

まず、開発サーバーを起動します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアクセスできます。

## 参考情報

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)