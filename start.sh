#!/bin/bash

# XHS-Downloader 启动脚本
# 使用 anaconda 的 uv 管理的虚拟环境

# 项目路径
PROJECT_DIR="/Users/azm/MyProject/xhs-dl"

# 使用 anaconda 的 uv 创建/激活虚拟环境
# 虚拟环境路径
VENV_PATH="$PROJECT_DIR/.venv"

# 创建虚拟环境（使用 Python 3.12）
if [ ! -d "$VENV_PATH" ]; then
    echo "创建虚拟环境..."
    cd "$PROJECT_DIR"
    /opt/anaconda3/bin/uv venv $VENV_PATH --python 3.12
fi

# 激活虚拟环境并安装依赖
echo "激活虚拟环境并安装依赖..."
cd "$PROJECT_DIR"
source "$VENV_PATH/bin/activate"

# 使用 pip 安装依赖到虚拟环境（如果还没有安装的话）
if ! python -c "import click" 2>/dev/null; then
    /opt/anaconda3/bin/pip install --target "$VENV_PATH/lib/python3.12/site-packages" -r requirements.txt
fi

# 启动应用（后台运行）
echo "启动 XHS-Downloader..."
cd "$PROJECT_DIR"
nohup python main.py > xhs-dl.log 2>&1 &
echo "XHS-Downloader 已启动，PID: $!"
echo "访问 http://127.0.0.1:5556 查看Web界面"