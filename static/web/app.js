class XHSDownloader {
    constructor() {
        this.apiUrl = '/xhs/detail';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHistory();
    }

    bindEvents() {
        document.getElementById('downloadBtn').addEventListener('click', () => this.handleDownload());
        document.getElementById('pasteBtn').addEventListener('click', () => this.handlePaste());
        document.getElementById('clearBtn').addEventListener('click', () => this.handleClear());
        
        document.getElementById('urlInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleDownload();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                const urlInput = document.getElementById('urlInput');
                if (document.activeElement !== urlInput) {
                    e.preventDefault();
                    urlInput.focus();
                }
            }
            
            if (e.key === 'Escape') {
                this.handleClear();
            }
        });
    }

    async handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('urlInput').value = text;
            this.showToast('已从剪贴板粘贴', 'success');
        } catch (err) {
            console.error('无法读取剪贴板:', err);
            this.showToast('无法读取剪贴板，请手动粘贴', 'error');
        }
    }

    handleClear() {
        document.getElementById('urlInput').value = '';
        document.getElementById('indexInput').value = '';
        document.getElementById('downloadCheck').checked = true;
        document.getElementById('skipCheck').checked = true;
        document.getElementById('progressList').innerHTML = '';
        document.getElementById('resultList').innerHTML = '';
        document.querySelector('.progress-section').style.display = 'none';
        document.querySelector('.result-section').style.display = 'none';
        this.showToast('已清空', 'info');
    }

    async handleDownload() {
        const url = document.getElementById('urlInput').value.trim();
        if (!url) {
            this.showToast('请输入作品链接', 'warning');
            return;
        }

        const download = document.getElementById('downloadCheck').checked;
        const skip = document.getElementById('skipCheck').checked;
        const indexText = document.getElementById('indexInput').value.trim();

        let index = null;
        if (indexText && !download) {
            this.showToast('指定图片序号需要勾选"下载作品文件"', 'warning');
            return;
        }

        if (indexText && download) {
            index = indexText.split(/[,\s]+/).map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        }

        const urls = this.extractUrls(url);
        if (urls.length === 0) {
            this.showToast('未找到有效的小红书链接', 'error');
            return;
        }

        document.querySelector('.progress-section').style.display = 'block';
        
        for (const singleUrl of urls) {
            await this.processUrl(singleUrl, download, index, skip);
        }
    }

    extractUrls(text) {
        const xhsPattern = /https?:\/\/(?:www\.)?xiaohongshu\.com\/(?:explore|discovery\/item|user\/profile\/[^\/]+)\/[^\s]+|https?:\/\/xhslink\.com\/[^\s]+/g;
        const matches = text.match(xhsPattern);
        return matches || [];
    }

    async processUrl(url, download, index, skip) {
        const progressItem = this.createProgressItem(url);
        document.getElementById('progressList').appendChild(progressItem);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    download: download,
                    index: index,
                    skip: skip
                })
            });

            const result = await response.json();
            
            if (result.message.includes('成功')) {
                this.updateProgressItem(progressItem, 'success', '成功');
                this.displayResult(result.data);
                this.saveToHistory(result.data);
                this.showToast(result.message, 'success');
            } else {
                this.updateProgressItem(progressItem, 'error', '失败');
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            console.error('下载失败:', error);
            this.updateProgressItem(progressItem, 'error', '网络错误');
            this.showToast('网络错误，请检查连接', 'error');
        }

        document.querySelector('.progress-section').style.display = 'none';
    }

    createProgressItem(url) {
        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <span class="title">${this.truncateUrl(url, 60)}</span>
            <span class="status">处理中...</span>
        `;
        return item;
    }

    updateProgressItem(item, status, message) {
        item.className = `progress-item ${status}`;
        item.querySelector('.status').textContent = message;
    }

    displayResult(data) {
        if (!data) return;

        const resultSection = document.querySelector('.result-section');
        resultSection.style.display = 'block';

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const title = data['作品标题'] || '无标题';
        const author = data['作者昵称'] || '未知作者';
        const downloadUrls = data['下载地址'] || [];

        let downloadLinks = '';
        if (Array.isArray(downloadUrls) && downloadUrls.length > 0) {
            downloadLinks = downloadUrls.map((url, i) => 
                `<a href="${url}" class="download-btn" target="_blank" download>文件 ${i + 1}</a>`
            ).join(' ');
        }

        resultItem.innerHTML = `
            <div class="item-info">
                <div class="item-title">${this.escapeHtml(title)}</div>
                <div class="item-author">作者: ${this.escapeHtml(author)}</div>
            </div>
            <div class="download-links">${downloadLinks}</div>
        `;

        document.getElementById('resultList').appendChild(resultItem);
    }

    truncateUrl(url, maxLength) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToHistory(data) {
        let history = JSON.parse(localStorage.getItem('xhs_history') || '[]');
        
        const historyItem = {
            id: data['作品ID'],
            title: data['作品标题'] || '无标题',
            author: data['作者昵称'] || '未知作者',
            date: new Date().toISOString()
        };

        history = history.filter(item => item.id !== historyItem.id);
        history.unshift(historyItem);

        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        localStorage.setItem('xhs_history', JSON.stringify(history));
        this.loadHistory();
    }

    loadHistory() {
        const history = JSON.parse(localStorage.getItem('xhs_history') || '[]');
        const historyList = document.getElementById('historyList');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #999;">暂无下载记录</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="info">
                    <div class="title">${this.escapeHtml(item.title)}</div>
                    <div class="author">作者: ${this.escapeHtml(item.author)}</div>
                </div>
                <div class="date">${this.formatDate(item.date)}</div>
            </div>
        `).join('');
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new XHSDownloader();
});
