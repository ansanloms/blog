---
createdAt: "2022-10-01T00:00:00+09:00"
---

# Google Home から自前のスマートリモコンを操作しました - 01. プロジェクト構築

[このまえ](./20220924-raspberry-pi-smart-remote-controller.md)作ったリモコンを Google Home から操作できるようにします。

触ったことがない firebase の素振りも兼ねています。

## 構成概要

[Smart Home platform](https://developers.google.com/assistant/smarthome/overview) を構築して、そこで Raspberry PI 上に構築した自前のスマートリモコンを操作します。

Google Home から Google Assistant を介して Raspberry PI 上に構築した自前のスマートリモコンを操作できるようにします。

## スマートホームのアクションを作成

<https://developers.google.com/assistant/smarthome/develop/create>

[Actions Console](https://console.actions.google.com/) にアクセスし、 New Project から Actions プロジェクトを作成します。

|                                   | 値                   |
| :-------------------------------- | :------------------- |
| Project Name                      | 任意のプロジェクト名 |
| Choose a language for your action | Japanese             |
| Choose your country or region     | Japan                |

![Create Action project](/assets/images/20221001-google-smart-home-01/actions-console-create-project.png)

`What kind of Action do you want to build?` の画面にて Smart Home を選択して Start Building を押下します。

![Get started](/assets/images/20221001-google-smart-home-01/actions-console-get-started.png)

ここまで実施すると Actions Console にプロジェクトができていると同時に、 [Firebase console](https://console.firebase.google.com/) 上にもプロジェクトができているはずです。

![Get started](/assets/images/20221001-google-smart-home-01/firebase-console-project.png)

## Firebase cli のインストール

Node.js と Firebase cli をインストールしておきます。

Node.js のバージョン管理には [Volta](https://volta.sh/) を利用しています。

```bash
winget install Volta.Volta
winget install Google.FirebaseCLI
```

```txt
> node -v
v16.17.1

> npm -v
8.15.1

> firebase --version
11.14.2
```

Google の開発アカウントでログインしておきます。

```bash
firebase login
```

## スマートホーム操作アプリの構築

スマートホーム操作のもろもろはこの Firebase プロジェクト上に構築していきます。

### Firebase プロジェクトの初期化

プロジェクトの作業ディレクトリを作成します。

```bash
mkdir smart-home
cd smart-home
```

Firebase プロジェクトを作成します。

```bash
firebase init
```

やっていきます。

```txt
> firebase init

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  C:\dev\smart-home

Before we get started, keep in mind:

  * You are currently outside your home directory

? Are you ready to proceed? (Y/n)
```

Firebase 機能は一旦確実に使う Functions のみ選択します。必要になったら `firebase use --add` で追加していくかんじで。

```txt
? Which Firebase features do you want to set up for this directory? Press Space to select features, then Enter to confirm your choices. (Press <space> to select, <a> to toggle all,
 <i> to invert selection, and <enter> to proceed)
 ( ) Realtime Database: Configure a security rules file for Realtime Database and (optionally) provision default instance
 ( ) Firestore: Configure security rules and indexes files for Firestore
>(*) Functions: Configure a Cloud Functions directory and its files
 ( ) Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys
 ( ) Hosting: Set up GitHub Action deploys
 ( ) Storage: Configure a security rules file for Cloud Storage
 ( ) Emulators: Set up local emulators for Firebase products
(Move up and down to reveal more choices)
```

Actions Console でプロジェクトを作成した際に同時に作成された Firebase プロジェクトがあるので、それに関連付けます。

```txt
? Please select an option: (Use arrow keys)
> Use an existing project
  Create a new project
  Add Firebase to an existing Google Cloud Platform project
  Don't set up a default project

? Select a default Firebase project for this directory:
> smart-home-sample02 (smart-home-sample02)
```

Functions の設定をしていきます。

- 使用言語は TypeScript
- ESLint を導入
- npm 依存をインストール

```txt
? What language would you like to use to write Cloud Functions? TypeScript
? Do you want to use ESLint to catch probable bugs and enforce style? Yes
? Do you want to install dependencies with npm now? Yes
```

完了しました。

```txt
+  Firebase initialization complete!
```

### Functions 素振り

とりあえず Hello World していきます。

`functions/src/index.ts` 上に既のコードがあります。

```typescript:functions/src/index.ts
import * as functions from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
```

#### ローカル上で起動

deploy する前に、ローカル上に functions をエミュレートして確認してみます。

まずはコードをビルドします。

```bash
npm run build
```

続いてエミュレータを起動します。

```bash
firebase emulators:start
```

これで local 上に funcitions の検証ができます。

```bash
$ curl http://127.0.0.1:5001/smart-home-sample02/us-central1/helloWorld
Hello from Firebase!
```

#### Deploy

local で確認できたので、実際に deploy してみます。

```bash
firebase deploy
```

エラーになりました。

```txt
Error: Your project smart-home-sample02 must be on the Blaze (pay-as-you-go) plan to complete this command. Required API artifactregistry.googleapis.com can't be enabled until the upgrade is complete. To upgrade, visit the following URL:

https://console.firebase.google.com/project/smart-home-sample02/usage/details
```

料金プランを変更する必要があるようです。 Blaze プランにします。

無料枠内の利用に留まる筈なので、余程変な使い方をしないかぎりお金はかからないはずです。けど一応 [Cloud Console](https://console.cloud.google.com/) 上の予算とアラートからアラートを設定しておいたほうがいいとおもいます。

料金プランを変更したら、あらためて deploy してみます。

```txt
+  Deploy complete!

Project Console: https://console.firebase.google.com/project/smart-home-sample02/overview
```

うまくいきました。 fuctions の関数を実行してみます。

```txt
$ curl https://us-central1-smart-home-sample02.cloudfunctions.net/helloWorld
Hello from Firebase!
```

できました。

### Functions 開発事前準備

本格的に開発を始めるまえにもろもろ準備をしていきます。

#### Node.js バージョン固定

Volta には、[プロジェクト毎に利用する Node.js / npm のバージョンを固定する機能](https://docs.volta.sh/guide/#why-volta)があります。

これで [Functions で利用する Node ランタイム](https://cloud.google.com/functions/docs/concepts/nodejs-runtime)にあわせてバージョンを固定します。

```bash
volta pin node@16
volta pin npm@8
```

バージョンを確認してみます。

```txt
> node -v
v16.18.1

> npm -v
8.19.3
```

package.json に固定バージョンが追記されます。

```diff:functions/package.json
+  "volta": {
+    "node": "16.18.1",
+    "npm": "8.19.3"
+  }
```

#### Prettier の導入

ESLint とは別に、コードフォーマッタの [Prettier](https://prettier.io/) を導入します。

```bash
npm i -D prettier eslint-config-prettier
```

.eslintrc.js の `extends` に `prettier` を追記します。これによって ESLint 上の Prettier と競合するルールは無効になります。

```diff:functions/.eslintrc.js
     "plugin:import/typescript",
     "google",
     "plugin:@typescript-eslint/recommended",
+    "prettier",
   ],
```

npm script の順次実行ができる `npm-run-all` を導入し、 lint のコマンドも更新します。

```bash
npm i -D npm-run-all
```

```diff:functions/package.json
   "scripts": {
-    "lint": "eslint --ext .js,.ts .",
+    "lint": "run-p --continue-on-error lint:*",
+    "lint:prettier": "prettier --loglevel warn --ignore-path .gitignore --check .",
+    "lint:eslint": "eslint --ext \".js,.ts\" --ignore-path .gitignore .",
+    "fix": "run-p --continue-on-error fix:*",
+    "fix:prettier": "prettier --loglevel warn --ignore-path .gitignore --write .",
+    "fix:eslint": "eslint --cache --ext \".js,.ts\" --ignore-path .gitignore --fix .",
     "build": "tsc",
```

これで `npm run fix` を実行すると ESLint と Prettier による Lint & Format がかかるはずです。

#### 依存のアップデート

とりあえず雑にアップデートしておきます。別に誰かが使うわけでもないし。

```bash
npx npm-check-updates -u
rm -rfv node_modules\ package-lock.json
npm install
```

#### デプロイ先のロケーションを変更する

<https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region>

デフォルトのロケーションは `us-central1` なので、明示的に `asia-northeast1` を指定するようにします。

```diff:functions/src/index.ts
-export const helloWorld = functions.https.onRequest((request, response) => {
-  functions.logger.info("Hello logs!", { structuredData: true });
-  response.send("Hello from Firebase!");
-});
+const region = "asia-northeast1";
+
+export const helloWorld = functions
+  .region(region)
+  .https.onRequest((request, response) => {
+    functions.logger.info("Hello logs!", { structuredData: true });
+    response.send("Hello from Firebase!");
+  });
```

デプロイしてみます。

```bash
firebase deploy
```

`us-central1` 上のリソースを削除するか聞かれるはずです。削除します。

```txt
? Would you like to proceed with deletion? Selecting no will continue the rest of the deployments. Yes
i  functions: creating Node.js 16 function helloWorld(asia-northeast1)...
i  functions: deleting Node.js 16 function helloWorld(us-central1)...
```

デプロイできました。

```txt
+  Deploy complete!
```

実行してみます。

```txt
> curl https://asia-northeast1-smart-home-sample02.cloudfunctions.net/helloWorld
Hello from Firebase!
```

## つづく

ここまででとりあえずスマートホーム操作アプリ構築の事前準備が完了しました。

次は認証処理を用意してきます。
