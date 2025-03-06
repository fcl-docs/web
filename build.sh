#!/bin/bash
# FCL文档站点构建脚本

echo "===== FCL文档网站构建脚本 ====="
echo "这是一个静态网站，无需特殊构建步骤"

# 确保脚本可执行权限
chmod +x build.sh

# 列出要部署的文件
echo "即将部署的文件列表:"
ls -la

# 创建输出目录（如果需要）
mkdir -p dist
cp -r *.html *.css *.js css/ js/ data/ images/ dist/

echo "===== 构建完成 ====="
exit 0 