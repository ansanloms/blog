---
title: Google Home から自前のスマートリモコンを操作しました - 05. フルフィルメントの実装
postDate: "2022-10-01T04:00:00+09:00"
---

[このまえ](/articles/20221001-google-smart-home-04)からの続きです。

## HomeGraph の有効化

例えば現状照明が点いているか等、デバイスの状態を管理する必要があります。

これには [HomeGraph](https://developers.google.com/assistant/smarthome/concepts/homegraph) を利用します。

HomeGraph とは、デバイスの状態を管理する所謂データベースになります。

### HomeGraph API の有効化

<https://developers.google.com/assistant/smarthome/develop/report-state?hl=ja#homegraph-api>

まずはプロジェクト上で HomeGraph API を利用できるようにします。

1. [Google Cloud Console](https://console.cloud.google.com/) 上から対象のプロジェクトを選択します。
2. [API ライブラリ](https://console.cloud.google.com/apis/library) 上にて [`HomeGraph` 等で検索](https://console.cloud.google.com/apis/library/browse?q=homegraph)します。
3. `HomeGraph API` を有効にします。

### サービス アカウント キーの作成

<https://developers.google.com/assistant/smarthome/develop/report-state?hl=ja#service-account-key>

API を実行する為の認証情報を用意します。

1. [Google Cloud Console](https://console.cloud.google.com/) 上から対象のプロジェクトを選択します。
2. [サービス アカウント キーの作成](https://console.cloud.google.com/apis/credentials/serviceaccountkey)に移動します。
3. [サービス アカウント キーの作成] ページに移動
4. [サービス アカウント] リストから [新しいサービス アカウント] を選択します。
5. [サービス アカウント名] フィールドに名前を入力します。
6. [サービス アカウント ID] フィールドに ID を入力します。
7. [ロール] リストから、[サービス アカウント] > [サービス アカウント トークン作成者] を選択します。
8. [キーのタイプ] として [JSON] を選択します。
9. [作成] をクリックするとキーが含まれている JSON ファイルがパソコンにダウンロードされます。

JSON ファイルは `functions/service-account.json` に置いておきます。認証情報なので `.gitignore` 等で除外しておく必要があります。

### functions 上で HomeGraph API を利用する

API クライアントのライブラリを導入します。

```
npm i googleapis
```

こんなかんじでクライアントを定義します。

```typescript:funcitons/src/index.ts
import { google } from "googleapis";

const homegraph = google.homegraph({
  version: "v1",
  auth: new google.auth.GoogleAuth({
    credentials: require("../service-account.json"),
    scopes: ["https://www.googleapis.com/auth/homegraph"],
  }),
});
```

## フルフィルメントの実装

前回適当に実装したフルフィルメントをそれなりに実装していきます。

### SYNC

<https://developers.google.com/assistant/smarthome/develop/process-intents#list-devices>

特にスマートホームアプリセットアップ時に実行されます。操作可能なデバイス一覧を返します。

前回のとりあえず処理から特に変更ないです。

```ts:functions/src/index.ts
app.onSync(async (body, headers) => {
  const id = await getAgentUserId(headers);

  return {
    requestId: body.requestId,
    payload: {
      agentUserId: id || "",
      devices: typeof id === "undefined" ? [] : [CeilingLight],
    },
  };
});
```

### QUERY

<https://developers.google.com/assistant/smarthome/develop/process-intents#handle_query_intents>

現在のデバイスの状態、例えば照明がついているかを取得します。

HomeGraph 上にあるデバイスの状態を取得し、レスポンスボディに含めます。

```ts:functions/src/index.ts
app.onQuery(async (body, headers) => {
  const id = await getAgentUserId(headers);

  if (typeof id === "undefined") {
    return {
      requestId: body.requestId,
      payload: {
        devices: {},
      },
    };
  }

  // 本当は CeilingLight であることを確認するべき。
  const device = body.inputs[0].payload.devices[0];

  const res = await homegraph.devices.query({
    requestBody: {
      requestId: body.requestId,
      agentUserId: id,
      inputs: [
        {
          payload: {
            devices: [
              {
                id: device.id,
              },
            ],
          },
        },
      ],
    },
  });

  return {
    requestId: body.requestId,
    payload: {
      devices: {
        [CeilingLight.id]: {
          status: "SUCCESS",
          online: true,
          // とりあえず照明の ON / OFF だけ。
          on:
            typeof res.data.payload?.devices?.[CeilingLight.id]?.on ===
            "boolean"
              ? res.data.payload.devices[CeilingLight.id].on
              : false,
        },
      },
    },
  };
});
```

### EXECUTE

<https://developers.google.com/assistant/smarthome/develop/process-intents#handle_query_intents>

デバイスの状態を更新します。

HomeGraph 上にあるデバイスの状態を更新するには [Report State](https://developers.google.com/assistant/smarthome/develop/report-state) を利用します。

```ts:functions/src/index.ts
app.onExecute(async (body, headers) => {
  const id = await getAgentUserId(headers);

  if (typeof id === "undefined") {
    return {
      requestId: body.requestId,
      payload: { commands: [] },
    };
  }

  // とりあえず照明の ON / OFF だけみる。
  const device = body.inputs[0].payload.commands[0].devices[0];
  const execution = body.inputs[0].payload.commands[0].execution[0];
  const states = {
    on: execution.params?.on === true,
  };

  await homegraph.devices.reportStateAndNotification({
    requestBody: {
      requestId: body.requestId,
      agentUserId: id,
      payload: {
        devices: {
          states: {
            [device.id]: states,
          },
        },
      },
    },
  });

  return {
    requestId: body.requestId,
    payload: {
      commands: [
        {
          ids: [device.id],
          status: "SUCCESS",
          states: { ...states, online: true },
        },
      ],
    },
  };
});
```

### DISCONNECT

<https://developers.google.com/assistant/smarthome/develop/process-intents#unlink>

アプリを Google Assistant 上から解除する際に実行されます。

前回のとりあえず処理から特に変更ないです。

```ts:functions/src/index.ts
app.onDisconnect(() => {
  functions.logger.log("User account unlinked from Google Assistant");
  return {};
});
```

## 実際に動かしてみる

ここで deploy して…でもいいですが、デバッグ等で頻繁にデバッグすることになるので、 local 上で functions を起動し、 [ngrok](https://ngrok.com/) で公開して検証します。

先ずは ngrok をインストールします。

```bash
scoop install ngrok
```

別途エミュレータも起動しておきます。

```bash
npm run build
firebase emulators:start
```

エミュレータ上では functions が 5001 ポートで起動しているはずです。なので ngrok で 5001 ポートを公開します。

```bash
ngrok http 5001
```

これで ngrok 上から local の `/fulfillment` にアクセスできるはずです。

```bash
https://example.ngrok.io/[PROJECT_ID]/asia-northeast1/fulfillment
```

この URL を(前回)[/articles/20221001-google-smart-home-04]実施したアクションの登録と同様に登録します。既存通りこれで動作するはずです。

## デバッグ

local 上のログは <http://127.0.0.1:4000/logs> より確認できるはずです。

HomeGraph の状況は [Home Graph Viewer](https://smarthome-test-suite.withgoogle.com/devices) より確認できます。

## つづく

次は自宅にある実際の家電と連携させます。
