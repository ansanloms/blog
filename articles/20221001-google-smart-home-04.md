---
title: Google Home から自前のスマートリモコンを操作しました - 04. スマートホームアプリの登録
postDate: "2022-10-01T03:00:00+09:00"
---

[このまえ](/articles/20221001-google-smart-home-03)からの続きです。

## アクション名の設定

任意のアクション名を設定します。

Action Console の対象プロジェクトに遷移し、上記メニューの [Develop] -> [Invocation] を選択します。

![Actions](/assets/images/20221001-google-smart-home-04/actions-console-invocation.png)

設定したら右上の [Save] を押下します。

## アクションの登録

実装したインテントを Action Console 上で設定していきます。

先ずは Firebase functions を徐にデプロイします。

```bash
npm run fix
firebase deploy
```

`/fulfillment` が function 上にデプロイされた際の URL を確認しておきます。

Action Console の対象プロジェクトに遷移し、上記メニューの [Develop] -> [Actions] を選択します。

![Actions](/assets/images/20221001-google-smart-home-04/actions-console-actions.png)

|                   | 値                                                    |
| :---------------- | :---------------------------------------------------- |
| Fulfillment URL   | `/fulfillment` が function 上にデプロイされた際の URL |
| Log level control | とりあえず `All`                                      |

他はデフォルトのままにします。

設定したら右上の [Save] を押下します。

## アカウントのリンク

続いて OAuth 2.0 サーバ(今回は Auth0)の情報を Action Console 上で設定していきます。

Action Console の対象プロジェクトに遷移し、上記メニューの [Develop] -> [Account linking] を選択します。

### OAuth Client Information

![OAuth Client Information](/assets/images/20221001-google-smart-home-04/actions-console-oauth-client-information.png)

以下のように設定します。

`Authorization URL` と `Token URL` に関しては Auth0 コンソールの [Applications] -> [対象 Application] -> [Settings] 内の Advanced Settings からも確認できます。

|                                            | 値                                   |
| :----------------------------------------- | :----------------------------------- |
| Client ID issued by your Actions to Google | `[AUTH0_CLIENT_ID]`                  |
| Client secret                              | `[AUTH0_CLIENT_SECRET]`              |
| Authorization URL                          | `https://[AUTH0_DOMAIN]/authorize`   |
| Token URL                                  | `https://[AUTH0_DOMAIN]/oauth/token` |

### Use your app for account linking (optional)

ここはなにも設定せずに次へ。

### Configure your client (optional)

![Configure your client](/assets/images/20221001-google-smart-home-04/actions-console-configure-your-client.png)

認証時に取得できるユーザ情報を指定します。とりあえず以下を設定しておきます。実際使うのは openid だけなはずです。

- openid
- email

ここまで設定したら右上の [Save] を押下します。

## スマートホームアプリを Google Assistant に登録する

作成したスマートホームアプリを自分のアカウントの Google Assistant に関連付けます。

スマートフォンに [Google Home アプリ](https://play.google.com/store/apps/details?id=com.google.android.apps.chromecast.app)をインストールします。

アプリ上の [Settings] を押下します。

![Settings](/assets/images/20221001-google-smart-home-04/home-settings.png)

ページ下部の [Works with Google] を押下します。

![Works with Google](/assets/images/20221001-google-smart-home-04/home-works-with-google.png)

設定したアクション名のアプリがあるはずなので選択します。

![Home Control](/assets/images/20221001-google-smart-home-04/home-home-control.png)

連携処理に進みます。 [Continue] を押下します。

![Link](/assets/images/20221001-google-smart-home-04/home-link.png)

認証します。 Auth0 上に登録したアカウントでログインします。

![](/assets/images/20221001-google-smart-home-04/home-login.png)

問題なければ設定したデバイスが登録されます。

![](/assets/images/20221001-google-smart-home-04/home-add-devices.png)

これで手元の Google Home から虚無にある照明を操作できるようになりました。フルフィルメントの設定がとりあえずなので正常には動作しません。

<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">進捗です。 <a href="https://t.co/BVm2nxQSqt">pic.twitter.com/BVm2nxQSqt</a></p>&mdash; ansanloms (@ansanloms) <a href="https://twitter.com/ansanloms/status/1594382929429340160?ref_src=twsrc%5Etfw">November 20, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## つづく

次回はフルフィルメントを実装していきます。
