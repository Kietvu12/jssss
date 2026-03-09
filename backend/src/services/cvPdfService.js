/**
 * Service tạo PDF từ CV template (Rirekisho + Shokumu)
 * Font: load qua page.goto(URL) để trang có origin thật → Google Fonts tải được, tránh ô vuông.
 */
import puppeteer from 'puppeteer';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';
import { generateCvTemplateHtml } from '../utils/cvTemplateHtml.js';

/** Store HTML tạm để Puppeteer load qua URL (giúp font từ Google Fonts tải đúng) */
const _htmlStore = new Map();

export function storeHtmlForPdf(html) {
  const id = uuidv4();
  _htmlStore.set(id, html);
  return id;
}

export function getStoredHtml(id) {
  return _htmlStore.get(id) || null;
}

export function deleteStoredHtml(id) {
  _htmlStore.delete(id);
}

const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
];

/** Các đường dẫn Chromium/Chrome phổ biến trên Linux. Thử lần lượt nếu chưa set PUPPETEER_EXECUTABLE_PATH. */
const CHROMIUM_FALLBACK_PATHS = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/lib/chromium-browser/chromium-browser',
  '/usr/lib/chromium/chromium',
  '/snap/bin/chromium',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chrome'
];

let _chromiumPathLogged = false;

function getChromiumExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    const p = process.env.PUPPETEER_EXECUTABLE_PATH.trim();
    if (p && existsSync(p)) return p;
  }
  for (const p of CHROMIUM_FALLBACK_PATHS) {
    if (p && existsSync(p)) {
      if (!_chromiumPathLogged) {
        console.log('[cvPdfService] Dùng Chromium tại:', p);
        _chromiumPathLogged = true;
      }
      return p;
    }
  }
  if (!_chromiumPathLogged) {
    console.warn('[cvPdfService] Không tìm thấy Chromium. Cài: sudo apt-get update && sudo apt-get install -y chromium-browser. Sau đó: export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser) và restart backend.');
    _chromiumPathLogged = true;
  }
  return null;
}

/**
 * Tạo PDF buffer từ HTML (dùng chung cho 1 tab hoặc full).
 * @param {Object} cv - CV model hoặc plain object
 * @param {Object} options - { avatarDataUrl, cvTemplate, tab: 'rirekisho'|'shokumu'|'all' }
 * @returns {Promise<Buffer|null>}
 */
async function _generateCvPdfBufferFromHtml(cv, options = {}) {
  const avatarDataUrl = options.avatarDataUrl || '';
  const cvTemplate = options.cvTemplate || 'common';
  const tab = options.tab || 'all';
  const html = generateCvTemplateHtml(cv, { avatarDataUrl, cvTemplate, tab });
  const port = config.port || process.env.PORT || 3000;
  const baseUrl = `http://127.0.0.1:${port}`;
  const renderId = storeHtmlForPdf(html);
  let browser = null;
  try {
    const executablePath = getChromiumExecutablePath();
    const launchOptions = {
      headless: true,
      args: PUPPETEER_ARGS
    };
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const renderUrl = `${baseUrl}/cv-pdf-render/${renderId}`;
    await page.goto(renderUrl, {
      waitUntil: 'networkidle0',
      timeout: 25000
    });
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise(r => setTimeout(r, 8000))
    ]).catch(() => {});
    if (avatarDataUrl) {
      await page.evaluate((dataUrl) => {
        const img = document.getElementById('cv-avatar-photo');
        if (img) img.src = dataUrl;
      }, avatarDataUrl);
      await page.waitForFunction(
        () => {
          const img = document.getElementById('cv-avatar-photo');
          return !img || !img.src || (img.complete && img.naturalWidth > 0);
        },
        { timeout: 8000 }
      ).catch(() => {});
    }
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      preferCSSPageSize: false
    });
    return Buffer.from(pdfBuffer);
  } catch (err) {
    console.error('[cvPdfService] Lỗi khi tạo PDF:', err.message);
    if (/Could not find Chrome|Failed to launch|executable doesn't exist/i.test(err.message || '')) {
      console.error('[cvPdfService] Trên server: chạy "sudo apt-get update && sudo apt-get install -y chromium-browser". Sau đó chạy "which chromium-browser" để lấy đường dẫn, set env: export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser (thay bằng path thật), rồi restart backend.');
    }
    return null;
  } finally {
    deleteStoredHtml(renderId);
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Tạo PDF buffer từ dữ liệu CV (cả 2 tab Rirekisho + Shokumu).
 * @param {Object} cv - CV model instance hoặc plain object
 * @param {Object} options - { avatarDataUrl: string, cvTemplate: string }
 * @returns {Promise<Buffer|null>} PDF buffer hoặc null
 */
export async function generateCvPdfBuffer(cv, options = {}) {
  return _generateCvPdfBufferFromHtml(cv, { ...options, tab: 'all' });
}

/**
 * Chỉ tạo PDF tab 履歴書 (Lý lịch - tab 1).
 */
export async function generateCvRirekishoPdfBuffer(cv, options = {}) {
  return _generateCvPdfBufferFromHtml(cv, { ...options, tab: 'rirekisho' });
}

/**
 * Chỉ tạo PDF tab 職務経歴書 (Lịch sử việc làm - tab 2).
 */
export async function generateCvShokumuPdfBuffer(cv, options = {}) {
  return _generateCvPdfBufferFromHtml(cv, { ...options, tab: 'shokumu' });
}
