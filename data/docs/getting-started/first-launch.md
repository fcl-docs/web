# 首次启动指南

首次启动FCL应用程序时，您需要完成一些初始设置。本指南将帮助您顺利完成这些步骤。

## 基本设置

:::tip 提示
如果您是第一次使用FCL启动器，建议按照以下步骤进行设置。
:::

### 权限设置

首次启动时，应用程序将请求以下权限：

1. **存储权限**：用于下载和存储游戏文件
2. **网络权限**：用于下载游戏资源和验证账户

:::warning 注意
如果您拒绝存储权限，FCL将无法正常工作。请确保授予所有请求的权限。
:::

### 初始配置

应用程序首次启动时会执行以下配置：

:::info
初始配置可能需要几分钟时间，具体取决于您的设备性能和网络状况。
:::

```java
// 这是FCL初始化的部分代码
public void initialize() {
    checkStorageAccess();
    createDirectories();
    initializeComponents();
    loadConfigurations();
}
```

## 账户设置

您可以使用以下方式登录：

:::code-group
```java
// 使用微软账户登录
MicrosoftAccount account = new MicrosoftAccount(username, password);
account.login();
```

```java
// 使用离线账户
OfflineAccount account = new OfflineAccount(username);
account.login();
```
:::

## 故障排除

如果您在启动过程中遇到问题：

:::details 常见问题
### 应用程序崩溃
可能是由于内存不足导致。尝试关闭后台应用程序并重启FCL。

### 无法下载资源
检查您的网络连接或尝试切换到其他下载源。

### 黑屏问题
某些设备上可能需要调整渲染设置。尝试在设置中更改渲染器选项。
:::

:::danger 警告
如果FCL反复崩溃且无法启动，请尝试清除应用数据。这将删除所有设置和已下载的资源。
:::