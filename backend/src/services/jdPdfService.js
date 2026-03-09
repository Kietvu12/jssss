/**
 * Service tạo PDF từ JD template
 */
import puppeteer from 'puppeteer';
import { generateJdTemplateHtml } from '../utils/jdTemplateHtml.js';

/**
 * Tạo PDF buffer từ dữ liệu Job (với recruitingCompany, category, salaryRanges, ...)
 * @param {Object} job - Job model instance đã include đầy đủ (recruitingCompany, category, salaryRanges, requirements, workingLocations, ...)
 * @returns {Promise<Buffer|null>} PDF buffer hoặc null nếu lỗi
 */
export async function generateJdPdfBuffer(job) {
  let browser = null;
  try {
    const html = generateJdTemplateHtml(job);
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    return Buffer.from(pdfBuffer);
  } catch (err) {
    console.error('[jdPdfService] Lỗi khi tạo PDF:', err.message);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
