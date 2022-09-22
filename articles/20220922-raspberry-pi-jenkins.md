---
layout: layouts/Article.tsx
title: Raspberry Pi 4 (Ubuntu Server) に Jenkins をインストールしました
date: 2022-09-02 00:00:00
---

## Java のインストール

```
sudo apt install default-jdk
```

## Jenkins のインストール

<https://www.jenkins.io/doc/book/installing/linux/#debianubuntu>

毎週リリース版でやっていきます。

```
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins
```

## 実行ユーザの変更

```
sudo vim /etc/default/jenkins
```

`JENKINS_USER` / `JENKINS_GROUP` を変更します。

```
JENKINS_USER=ansanloms
JENKINS_GROUP=ansanloms
```

関連するファイルやディレクトリの権限を変更します。

```
sudo chown -R ansanloms:ansanloms /var/lib/jenkins /var/log/jenkins /var/cache/jenkins
```

systemctl での実行ユーザを変更します。

```
sudo vim /lib/systemd/system/jenkins.service
```

`User` / `Group` を変更します。

```
User=ansanloms
Group=ansanloms
```

リロードし、起動します。

```
sudo systemctl daemon-reload
sudo systemctl start jenkins.service
```
