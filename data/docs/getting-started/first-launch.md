# 首次启动

本指南将帮助您完成FCL启动器的首次启动设置。

## 初始配置

首次启动FCL时，您需要进行一些基本配置。

::: tip 提示
建议使用WiFi连接进行首次启动，因为需要下载Java运行时和游戏文件。
:::

### 存储权限设置

启动应用后，FCL会请求存储权限，这对于下载和管理游戏文件是必需的。

::: warning 权限问题
如果您拒绝了权限请求，FCL将无法正常工作。您可以在系统设置中稍后启用这些权限。
:::

## 添加游戏账号

要玩Minecraft，您需要添加一个游戏账号。FCL支持以下账号类型：

::: code-group
```java
// 离线账号设置示例
String username = "Player" + new Random().nextInt(1000);
OfflineAccount account = new OfflineAccount(username);
launcher.setAccount(account);
```

```java
// 微软账号设置示例
MicrosoftAccount account = new MicrosoftAccount();
account.login(email, password);
launcher.setAccount(account);
```

```java
// 外置账号设置示例
AuthlibInjectorAccount account = new AuthlibInjectorAccount();
account.setServer("https://authserver.example.com");
account.login(username, password);
launcher.setAccount(account);
```
:::

### 离线账号

::: info 注意
离线账号只能用于单人游戏或支持离线模式的服务器。
:::

1. 点击"账号"选项卡
2. 选择"添加账号"
3. 选择"离线账号"
4. 输入您想使用的用户名
5. 点击"添加"

### 微软账号（正版）

::: details 正版账号优势
使用正版账号可以：
- 访问所有多人游戏服务器
- 保存您的皮肤和进度到云端
- 支持官方内容的开发
:::

1. 点击"账号"选项卡
2. 选择"添加账号"
3. 选择"微软账号"
4. 按照提示完成Microsoft登录流程
5. 授权FCL访问您的Minecraft资料

::: danger 账号安全
绝不要在不信任的应用中输入您的微软账号密码。FCL使用官方的OAuth流程，不会直接处理您的密码。
:::

## 下一步

成功设置账号后，您可以：

1. [下载游戏版本](../user-guide/game-management)
2. [配置游戏设置](../user-guide/game-management#游戏设置)
3. [安装插件](../plugins/overview)