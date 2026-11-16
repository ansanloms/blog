---
createdAt: "2026-11-17T00:00:00+09:00"
---

# Docker のアプリに Tailscale のサイドカーで名前を付けました

自宅のサーバで Docker Compose のアプリをいくつか動かしています。どれも Tailscale 経由で `http://<サーバ>:<port>/` のように開いていたのですが、アプリごとに port を覚えるのが面倒になってきました。

そこでアプリごとに Tailscale のサイドカーを付け、`http://navidrome.<tailnet>.ts.net/` のように名前で開けるようにしました。

## 対象のアプリ

| アプリ                                                                    | port  | リポジトリ                                                                                  |
| ------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| [Navidrome](https://www.navidrome.org/) (音楽サーバ)                      | 4533  | [docker-music-streaming-server](https://github.com/ansanloms/docker-music-streaming-server) |
| [Feishin](https://github.com/jeffvli/feishin) (Navidrome の Web プレイヤ) | 9180  | 同上                                                                                        |
| [mirakc-ui](https://github.com/ansanloms/mirakc-ui) (mirakc の Web UI)    | 8000  | mirakc-ui                                                                                   |
| [VOICEVOX ENGINE](https://github.com/VOICEVOX/voicevox_engine)            | 50021 | [docker-voicevox](https://github.com/ansanloms/docker-voicevox)                             |

サーバ本体はもともと Tailscale に参加しています。

## 方式を選ぶ

名前で開く方法はいくつかあります。

- サブパスで振り分ける: サーバ本体の `tailscale serve` で `http://<サーバ>.<tailnet>.ts.net/navidrome/` のように振り分けます。ただしアプリ側がサブパスの下で動ける必要があります。mirakc-ui はドメイン直下で動く前提の作りなので、これは見送りました。
- Tailscale Services をサーバ本体で使う: 1 台の端末に、サービスごとの名前を付けられる機能です。ただし Service を出す端末はタグ付きでなければならず、ユーザで認証した端末はホストになれません。サーバ本体の所有者が自分ではなくなるので見送りました。
- Tailscale Services をサイドカーで使う: タグ付きのサイドカーの中で Services を出します。ただ、コンテナの `TS_SERVE_CONFIG` で Services を出す経路には、この記事を書いた時点で未解決の不具合がありました。
  - [tailscale/tailscale#19693](https://github.com/tailscale/tailscale/issues/19693): Services が公開されない。
  - [tailscale/tailscale#21455](https://github.com/tailscale/tailscale/issues/21455): 再起動後に Services が公開し直されない。
- アプリごとにサイドカーを付ける: アプリごとに Tailscale のコンテナを 1 つ置き、その端末名でアプリを開きます。[Tailscale のブログの Docker のガイド](https://tailscale.com/blog/docker-tailscale-guide) にある形です。

アプリごとにサイドカーを付ける方式にしました。tailnet の端末はアプリの数だけ増えますが、サーバ本体は自分の端末のままで済み、設定も各リポジトリの `compose.yaml` に閉じます。

## 管理画面での準備

### タグを定義する

サイドカーは自分の端末ではなくタグ付きの端末として参加させます。タグ付きの端末は、既定で鍵の期限が切れません。

Access controls のポリシーの `tagOwners` に、コンテナ用のタグを定義します。書き方は [Tags](https://tailscale.com/kb/1068/tags) を見てください。

```json
"tagOwners": {
  "tag:container": ["autogroup:admin"],
},
```

### 認証鍵を発行する

Settings の Keys で、認証鍵を発行します。

- Reusable: オン。4 つのサイドカーで同じ鍵を使います。
- Ephemeral: オフ。止めても端末を消さないためです。
- Tags: 上で定義したタグを付けます。

鍵は参加するときにだけ使います。参加した後に鍵の期限が切れても、サイドカーは動き続けます。

## compose.yaml

VOICEVOX ENGINE の例です。

```yaml
services:
  backend:
    image: docker.io/voicevox/voicevox_engine:cpu-0.26.2
    network_mode: service:tailscale-voicevox
    depends_on:
      - tailscale-voicevox
    restart: unless-stopped
    tmpfs:
      - /tmp

  tailscale-voicevox:
    image: docker.io/tailscale/tailscale:v1.104.7
    environment:
      TS_AUTHKEY: ${TS_AUTHKEY:?TS_AUTHKEY を .env に設定する}
      TS_HOSTNAME: voicevox
      TS_STATE_DIR: /var/lib/tailscale
      TS_SERVE_CONFIG: /config/serve.json
      TS_AUTH_ONCE: "true"
    volumes:
      - tailscale-voicevox-state:/var/lib/tailscale
    configs:
      - source: tailscale-voicevox-serve
        target: /config/serve.json
    ports:
      - "50021:50021"
    restart: unless-stopped

volumes:
  tailscale-voicevox-state:

configs:
  tailscale-voicevox-serve:
    content: |
      {
        "TCP": { "80": { "HTTP": true } },
        "Web": {
          "voicevox.${TS_TAILNET:?TS_TAILNET を .env に設定する}:80": {
            "Handlers": { "/": { "Proxy": "http://127.0.0.1:50021" } }
          }
        }
      }
```

- アプリ (`backend`) は `network_mode: service:tailscale-voicevox` で、サイドカーと同じネットワークに入れます。サイドカーからはアプリが `127.0.0.1` に見えます。
- `tailscale serve` の文書には、転送先は `http://127.0.0.1` だけに対応すると書かれています。そのためアプリを別のコンテナ名で呼ぶのではなく、同じネットワークに入れています。
- アプリに付けていた `ports:` はサイドカーへ移します。番号は変えないので、これまでの `http://<サーバ>:50021/` でも開けます。
- `TS_STATE_DIR` は volume に保存します。保存しないと、再起動のたびに新しい端末として参加します。
- `TS_AUTH_ONCE: "true"` で、すでに参加済みなら再起動のときに認証し直しません。

`.env` には次の 2 つを書きます。

```sh
TS_AUTHKEY=tskey-auth-xxxx
TS_TAILNET=xxxx.ts.net
```

`TS_TAILNET` は tailnet の DNS 名で、管理画面の DNS ページに出ています。

Navidrome と Feishin のように 1 つの compose に 2 つのアプリがある場合は、サイドカーも 2 つ置きます。

## serve の設定

最初は Tailscale のブログの例にならって、`${TS_CERT_DOMAIN}:443` の HTTPS で出そうとしました。ところがサイドカーのログに次の警告が出て、転送されませんでした。

```txt
serve proxy: this node is configured as a proxy that exposes an HTTPS endpoint to tailnet,
(perhaps a Kubernetes operator Ingress proxy) but it is not able to issue TLS certs, so this will likely not work.
To make it work, ensure that HTTPS is enabled for your tailnet, see https://tailscale.com/kb/1153/enabling-https for more details.
```

tailnet で HTTPS の証明書を有効にしていなかったのが原因でした。

有効にすること自体は管理画面ですぐできます。ただ [Enabling HTTPS](https://tailscale.com/kb/1153/enabling-https) によると、証明書を取った端末の名前は公開のログ (Certificate Transparency) に載ります。アプリの名前が残るのは避けたかったので、HTTPS は使わず HTTP の 80 番で出すことにしました。tailnet の中の通信は WireGuard で暗号化されています。

HTTP で出す設定はサイドカーの中で一度 `tailscale serve` を打ち、その結果を見て書きました。

```bash
$ docker compose exec tailscale-voicevox tailscale serve --bg --http=80 http://127.0.0.1:50021
$ docker compose exec tailscale-voicevox tailscale serve status --json
{
  "TCP": {
    "80": {
      "HTTP": true
    }
  },
  "Web": {
    "voicevox.xxxx.ts.net:80": {
      "Handlers": {
        "/": {
          "Proxy": "http://127.0.0.1:50021"
        }
      }
    }
  }
}
```

`Web` のキーに tailnet 名入りの FQDN が要ります。ここで 2 つハマりました。

- `${TS_CERT_DOMAIN}` を使うと、HTTPS が無効な tailnet では `no-https` に置き換わります。キーが `no-https:80` になり、アクセスすると 404 でした。
- キーを `voicevox:80` のように短い名前にしても、FQDN と短い名前のどちらでアクセスしても 404 でした。

リポジトリは公開しているので、tailnet 名を書いたファイルは commit したくありません。そこで compose の `configs:` に JSON を直書きし、FQDN の tailnet 名の部分に `.env` の `TS_TAILNET` を埋め込むようにしました。

## 確認

起動します。

```bash
docker compose up -d
```

管理画面に、タグ付きの端末として `voicevox` などが増えます。tailnet の別の端末から開いてみます。

```bash
$ curl http://voicevox.xxxx.ts.net/version
"0.26.2"
```

`http://voicevox/version` のような短い名前でも開けました。これまでの `http://<サーバ>:50021/version` も引き続き開けます。

## おわり

アプリを足すときは、サイドカーと `configs:` の組を 1 つ足すだけで済みます。
