---
title: Google Home から自前のスマートリモコンを操作しました - 03. インテントの実装
postDate: "2022-10-01T02:00:00+09:00"
---

[このまえ](/articles/20221001-google-smart-home-02)からの続きです。

## デバイスとトレイト

<https://developers.google.com/assistant/smarthome/concepts/devices-traits>

Smart Home Action では予め操作できる家電の種別が決定しており、それがデバイスになります。

各デバイスでは操作できる内容があります。それがトレイトです。

## インテントとフルフィルメント

<https://developers.google.com/assistant/smarthome/concepts/intents>

Smart Home Action と Google Assistant ないしは Home アプリとのやりとりをするインテント、要は API エンドポイントを構築します。

インテント上にフルフィルメント、つまり各種の処理定義を記述していきます。

| フルフィルメント                                                                                           | 概要                                                                     |
| :---                                                                                                       | :---                                                                     |
| [action.devices.SYNC](https://developers.google.com/assistant/smarthome/concepts/intents#sync)             | 操作可能なデバイス一覧の取得(スマートホームアプリセットアップ時の登録)。 |
| [action.devices.QUERY](https://developers.google.com/assistant/smarthome/concepts/intents#query)           | デバイスの状態を取得。                                                   |
| [action.devices.EXECUTE](https://developers.google.com/assistant/smarthome/concepts/intents#execute)       | デバイスの操作。                                                         |
| [action.devices.DISCONNECT](https://developers.google.com/assistant/smarthome/concepts/intents#disconnect) | スマートホームアプリの解除。                                             |

HTTP METHOD でいうなら、 SYNC: PUT / QUERY: GET / EXECUTE: POST / DISCONNECT: DELETE ってところでしょうか。知らんけど。

## インテントの実装

<https://developers.google.com/assistant/smarthome/develop/process-intents>

実際に functions 上へ実装していきます。

> 以降の実装はこうもうろもろと「とりあえず」的なアレです。

### Actions on Google ライブラリのインストール

インテントとフルフィルメントは所謂 REST API ですが、これらの実装を簡素化できるライブラリがあるので導入します。

```bash
npm i actions-on-google
```

どうもライブラリ内の型定義に問題があるようでビルドできないので、 `tsconfig.json` を以下の通り更新します。

```diff:functions/tsconfig.json
     "outDir": "lib",
     "sourceMap": true,
     "strict": true,
-    "target": "es2017"
+    "target": "es2017",
+    "skipLibCheck": true
   },
   "compileOnSave": true,
   "include": ["src"]
```

### インテントの定義

functions の `/fulfillment` をインテントとします。

```ts:functions/src/index.ts
import { smarthome } from "actions-on-google";

const app = smarthome({ debug: true });

export const fulfillment = functions.region(region).https.onRequest(app);
```

### 操作するデバイスの定義

今回は天井照明を操作しようとおもいます。

該当するデバイスは [LIGHT](https://developers.google.com/assistant/smarthome/guides/light) になります。

LIGHT には以下トレイトが定義されています。

| トレイト                                                                                                    | 実装必須 | 概要                            |
| :---                                                                                                        | :---:    | :---                            |
| [action.devices.traits.OnOff](https://developers.google.com/assistant/smarthome/traits/onoff)               | ✅       | ライトの ON および OFF を行う。 |
| [action.devices.traits.ColorSetting](https://developers.google.com/assistant/smarthome/traits/colorsetting) |          | ライトの色見を調整する。        |
| [action.devices.traits.Brightness](https://developers.google.com/assistant/smarthome/traits/brightness)     |          | ライトの明るさを調整する。      |

`functions/src/configs/devices.ts` あたりに定義しておきます。

```typescript:functions/src/configs/devices.ts
import type { SmartHomeV1SyncDevices } from "actions-on-google";

export const CeilingLight: SmartHomeV1SyncDevices = {
  id: "ceiling_light",
  type: "action.devices.types.LIGHT",
  traits: ["action.devices.traits.OnOff"],
  name: {
    defaultNames: ["照明"],
    name: "照明",
    nicknames: ["照明"],
  },
  willReportState: true,
  otherDeviceIds: [
    {
      deviceId: "ceiling_light",
    },
  ],
};
```

定義内容は <https://developers.google.com/assistant/smarthome/reference/rest/v1/devices/sync#device> を参照ください。

今回は照明の ON / OFF のみできるようにします。

`willReportState` は後述する HomeGraph API 上からデバイスを操作する際に必要な設定です。 `true` にしておきます。

`otherDeviceIds` はかなり後述にあるローカルフルフィルメントで必要な値です。とりあえず `id` と同一値を設定しておきます。

### ユーザの認証処理

<https://developers.google.com/assistant/smarthome/develop/process-intents#user-id>

インテントへのリクエストヘッダ `Authorization` に、予め用意した OAuth 2.0 サーバ(今回であれば Auth0)から提供される Bearer トークンがあるはずです。

これを基に操作するユーザを判定します。 Auth0 の認証クライントを用意します。

認証情報は `.env` に記述します。なので [dotenv](https://www.npmjs.com/package/dotenv) も導入します。

```bash
npm i auth0 dotenv
npm i -D @types/auth0
```

`.env` に認証関連の情報を定義しておきます。

```bash:functions/.env
AUTH0_DOMAIN="[AUTH0_DOMAIN]"
AUTH0_CLIENT_ID="[AUTH0_CLIENT_ID]"
```

リクエストヘッダの Authorization よりユーザ ID を特定します。今回は openid をユーザ ID とします。

```ts:functions/src/index.ts
import * as dotenv from "dotenv";
dotenv.config();

import { AuthenticationClient } from "auth0";

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN || "",
  clientId: process.env.AUTH0_CLIENT_ID || "",
});

const getAgentUserId = async (
  headers: ActionOnGoogleHeaders
): Promise<string | undefined> => {
  const authorization = headers.authorization;
  functions.logger.debug("getAgentUserId - authorization:", authorization);

  const token =
    typeof authorization === "string" ? authorization.substr(7) : undefined;
  functions.logger.debug("getAgentUserId - token:", token);
  if (typeof token === "undefined") {
    return undefined;
  }

  const profile = await auth0.getProfile(token);
  functions.logger.debug("getAgentUserId - profile:", profile);

  const id =
    typeof profile.sub === "string" ? (profile.sub as string) : undefined;
  functions.logger.debug("getAgentUserId - id:", id);

  return id;
};
```

### 各種フルフィルメントの実装(とりあえず)

一旦スマートホームアプリと HOME アプリを連携するところまでみたいので、とりあえずフルフィルメントを実装します。

認証するだけなら SYNC のみあればいいと思いますが、まぁ全部書いておきます。

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

app.onQuery(async (body, headers) => {
  const id = await getAgentUserId(headers);

  return {
    requestId: body.requestId,
    payload: {
      devices:
        typeof id === "undefined"
          ? {}
          : {
              [CeilingLight.id]: {
                status: "SUCCESS",
                online: true,
                on: true,
              },
            },
    },
  };
});

app.onExecute(async (body, headers) => {
  const id = await getAgentUserId(headers);

  if (typeof id === "undefined") {
    return {
      requestId: body.requestId,
      payload: { commands: [] },
    };
  }

  return {
    requestId: body.requestId,
    payload: {
      commands: [
        {
          ids: [CeilingLight.id],
          status: "SUCCESS",
          states: { on: true, online: true },
        },
      ],
    },
  };
});

app.onDisconnect(() => {
  functions.logger.log("User account unlinked from Google Assistant");
  return {};
});
```

## つづく

次回は作成したスマートホームアプリを自身の Home デバイスに追加します。
