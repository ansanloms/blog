---
title: Raspberry Pi 4 (Ubuntu Server) に Jenkins をインストールしました
postDate: "2022-09-02T00:00:00+09:00"
---

## Java のインストール

```bash
sudo apt install default-jdk
```

## Jenkins のインストール

<https://www.jenkins.io/doc/book/installing/linux/#debianubuntu>

毎週リリース版でやっていきます。

```bash
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins
```

## 実行ユーザの変更

```bash
sudo vim /etc/default/jenkins
```

`JENKINS_USER` / `JENKINS_GROUP` を変更します。

```ini:/etc/default/jenkins
JENKINS_USER=ansanloms
JENKINS_GROUP=ansanloms
```

関連するファイルやディレクトリの権限を変更します。

```bash
sudo chown -R ansanloms:ansanloms /var/lib/jenkins /var/log/jenkins /var/cache/jenkins
```

systemctl での実行ユーザを変更します。

```bash
sudo vim /lib/systemd/system/jenkins.service
```

`User` / `Group` を変更します。

```ini:/lib/systemd/system/jenkins.service
User=ansanloms
Group=ansanloms
```

リロードし、起動します。

```bash
sudo systemctl daemon-reload
sudo systemctl start jenkins.service
```
