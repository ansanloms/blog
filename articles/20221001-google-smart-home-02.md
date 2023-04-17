---
title: Google Home から自前のスマートリモコンを操作しました - 02. 認証処理
postDate: "2022-10-01T01:00:00+09:00"
---

[このまえ](/articles/20221001-google-smart-home-01)からの続きです。

## ユーザ認証サーバ構築

<https://developers.google.com/assistant/smarthome/develop/implement-oauth>

スマートホームアクションではユーザ認証機能必要です。その為には OAuth 2.0 サーバ構築が必要です。

~~OAuth 知識がゆるふわな為~~かなり面倒なので、認証処理はぜんぶ [Auth0](https://auth0.com) にて用意します。

Auth0 アカウントを作成しておきます。

### Tenant の作成

まずは Tenant を作成します。プロジェクトのドメインみたいなやつです。コンソール左上のメニューから [Create tenant] を選択します。

アカウント作成時にデフォルトで Tenant をつくっているはずですなので、それを利用してもいいとおもいます。

![Create Tenant](/assets/images/20221001-google-smart-home-02/auth0-create-tenant.png)

- Tenant Domain: これがそのまま認証 URL や token URL 等のドメインになります。
- Region: ホスト先を選択します。
- Environment Tag: 環境を選択します。個人利用ですし無料枠内で利用しますし、 Development でいいはずです。

### Application の作成

実際にユーザ認証する OAuth 2.0 アプリケーションを用意します。メニューから [Application] を選択します。

既に規定の Application がありますが、 [+ Create Application] を押下して別途新たに作成します。もちろん規定の Application を流用してもいいと思います。

![Create Application](/assets/images/20221001-google-smart-home-02/auth0-create-application.png)

- Name: なにかわかりやすい名前。今回は `Smart home Action` にしました。
- Choose an application type: `Regular Web Applications` を選択します。

Create を押下で Application が作成されます。 Quick Start が表示されますが無視して Setting に移動します。

#### Basic Information

以下を控えておきます。

- `Domain`
- `Client ID`
- `Client Secret`

以下 [AUTH0_DOMAIN] / [AUTH0_CLIENT_ID] / [AUTH0_CLIENT_SECRET] で提示します。

#### Application Properties

`Application Type` を `Regular Web Applications` にしておきます。作成時に選択しているはずなので既に選択されているはずです。

#### Application URIs

`Allowded Callback URLs` には以下を設定します。カンマ区切り 1 行で指定します。

[PROJECT_ID] には Actions Console 上(ないしは Firebase の) Project ID を指定します。

- [A] `https://[AUTH0_DOMAIN]/userinfo`
- [B] `https://oauth-redirect.googleusercontent.com/r/[PROJECT_ID]`
- [C] `https://oauth-redirect-sandbox.googleusercontent.com/r/[PROJECT_ID]`

[A] は認証したユーザ情報を取得する際に利用します。詳しくは <https://auth0.com/docs/api/authentication#get-user-info> を参照ください。

[B] / [C] は承認リクエストを処理する際に利用します。詳しくは <https://developers.google.com/assistant/smarthome/develop/implement-oauth#implement_your_oauth_20_server> を参照ください。

`Allowed Web Origins` には以下を設定します。カンマ区切り 1 行で指定します。

- `https://oauth-redirect.googleusercontent.com`
- `https://oauth-redirect-sandbox.googleusercontent.com`

ここまでやったら保存します。

### 接続設定

続いて Connecitons タブに移動します。ここでは認証方法を指定します。

デフォルトだと以下が有効になっているはずです。

- `Username-Password-Authentication` : 自前の username / password で認証する。
- `google-oauth2` : Google アカウントを用いて認証する。

今回はじぶんちの家電を操作するので、自分以外のアカウントは必要ないです。

なので `google-oauth2` は無効にし、 `Username-Password-Authentication` のみでやっていきます。

### アカウントの追加

アカウントも Auth0 のコンソール上から予め作っておきます。外部から追加することはないです。

メニューから [User Management] -> [Users] を選択し、 [+ Create user] から任意のユーザを作っておきます。

アカウントが作成されたら、対象アカウントの [Details] 内にある [Email] を edit し、 `Set email as Verified` を押下してメールアドレスを承認しておきます。

## つづく

ここまでで認証処理を用意しました。

次は実際に Home アプリへ Smart Home Action を追加してきます。
