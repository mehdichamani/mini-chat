/**
 * app.js — Shared utilities for Mini Chat frontend
 * Used by both chat.html and admin.html
 */

'use strict';

// ─── Toast Notification ───────────────────────────────────────────────────────
window.toast = function(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${escHtml(message)}</span>`;
  container.appendChild(el);

  // Auto remove
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3200);
};

// ─── Escape HTML ──────────────────────────────────────────────────────────────
window.escHtml = function(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ─── Format Timestamp ─────────────────────────────────────────────────────────
window.formatTime = function(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return timeStr;
  return d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) + ' ' + timeStr;
};

// ─── Format File Size ─────────────────────────────────────────────────────────
window.formatSize = function(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// ─── File Type Icon ───────────────────────────────────────────────────────────
window.fileTypeIcon = function(type, name) {
  if (type === 'image') return '🖼️';
  if (type === 'video') return '🎬';
  if (type === 'audio') return '🎵';
  const ext = (name || '').split('.').pop().toLowerCase();
  const icons = {
    pdf: '📄', zip: '📦', rar: '📦', '7z': '📦',
    txt: '📝', csv: '📊', doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊'
  };
  return icons[ext] || '📎';
};

// ─── Build file bubble HTML ───────────────────────────────────────────────────
window.buildFileHtml = function(file) {
  if (!file || !file.url) return '';

  if (file.type === 'image') {
    return `
      <div class="img-bubble">
        <img src="${escHtml(file.url)}" alt="${escHtml(file.name)}" loading="lazy">
      </div>
    `;
  }

  if (file.type === 'video') {
    return `
      <video controls style="max-width:280px;border-radius:10px;display:block;margin-bottom:4px;">
        <source src="${escHtml(file.url)}" type="video/mp4">
        مرورگر شما از ویدیو پشتیبانی نمی‌کند.
      </video>
    `;
  }

  if (file.type === 'audio') {
    return `
      <audio controls style="width:250px;margin-bottom:4px;">
        <source src="${escHtml(file.url)}">
        مرورگر شما از صدا پشتیبانی نمی‌کند.
      </audio>
    `;
  }

  // Generic file
  return `
    <a class="file-bubble" href="${escHtml(file.url)}" download="${escHtml(file.name)}" target="_blank">
      <div class="file-icon">${fileTypeIcon(file.type, file.name)}</div>
      <div class="file-info">
        <div class="file-name">${escHtml(file.name)}</div>
        <div class="file-size">${formatSize(file.size)}</div>
      </div>
    </a>
  `;
};

// ─── Render a message bubble ──────────────────────────────────────────────────
window.renderMessage = function(msg, animate) {
  const area = document.getElementById('messages-area');
  if (!area) return;
  if (area.querySelector(`[data-id="${msg.id}"]`)) return;

  const isOwn = msg.sender === 'guest'; // Guest sees own messages on right
  const wrap = document.createElement('div');
  wrap.className = `message-wrap ${isOwn ? 'out' : 'in'}`;
  wrap.dataset.id = msg.id;

  let content = '';
  if (msg.file) content += buildFileHtml(msg.file);
  if (msg.text) content += `<div class="bubble-text">${escHtml(msg.text)}</div>`;
  content += `<div class="bubble-time ${isOwn ? '' : 'in-time'}">${formatTime(msg.timestamp)}</div>`;

  wrap.innerHTML = `<div class="bubble">${content}</div>`;
  area.appendChild(wrap);

  // Bind image lightbox
  wrap.querySelectorAll('.img-bubble img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const lb = document.getElementById('lightbox');
      const lbImg = document.getElementById('lightbox-img');
      if (lb && lbImg) {
        lbImg.src = img.src;
        lb.classList.remove('hidden');
      }
    });
  });
};

// ─── Add system divider message ───────────────────────────────────────────────
window.addSystemMessage = function(text) {
  const area = document.getElementById('messages-area');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'date-divider';
  div.innerHTML = `<span>${escHtml(text)}</span>`;
  area.appendChild(div);
};

// ─── Scroll messages to bottom ────────────────────────────────────────────────
window.scrollToBottom = function() {
  const area = document.getElementById('messages-area');
  if (area) requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
};

// ─── String to deterministic color ───────────────────────────────────────────
window.strToColor = function(str) {
  const colors = [
    'linear-gradient(135deg, #5288c1, #3a6ea8)',
    'linear-gradient(135deg, #4ca8a8, #2e7a7a)',
    'linear-gradient(135deg, #9b59b6, #7d3c98)',
    'linear-gradient(135deg, #e67e22, #ca6f1e)',
    'linear-gradient(135deg, #27ae60, #1e8449)',
    'linear-gradient(135deg, #e74c3c, #c0392b)',
    'linear-gradient(135deg, #2980b9, #1a5276)',
    'linear-gradient(135deg, #f39c12, #d68910)',
  ];
  let hash = 0;
  for (const ch of (str || '')) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
};

// ─── Paste image from clipboard ───────────────────────────────────────────────
document.addEventListener('paste', async (e) => {
  const items = Array.from(e.clipboardData?.items || []);
  const imgItem = items.find(i => i.type.startsWith('image/'));
  if (!imgItem) return;

  const file = imgItem.getAsFile();
  if (!file) return;

  // Only act if we're in a chat page
  const guestFileInput = document.getElementById('file-input');
  const adminAttachBtn = document.getElementById('admin-attach-btn');

  if (guestFileInput || adminAttachBtn) {
    e.preventDefault();
    toast('تصویر کپی‌شده شناسایی شد، در حال آپلود...', 'info');

    const fd = new FormData();
    fd.append('file', file, `paste-${Date.now()}.png`);
    try {
      const res = await fetch('/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        const pending = { url: data.url, name: data.name, size: data.size, type: data.type };

        if (guestFileInput) {
          // In guest chat
          window.__guestPendingFile = pending;
          document.getElementById('preview-name').textContent = data.name;
          document.getElementById('upload-preview').classList.remove('hidden');
          toast('تصویر آماده ارسال است', 'success');
        }
      } else {
        toast(data.message || 'خطا در آپلود', 'error');
      }
    } catch { toast('خطا در آپلود تصویر', 'error'); }
  }
});
