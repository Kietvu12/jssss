import { useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './RichTextEditor.css';
import apiService from '../../services/api';

const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const fontNames = ['sans-serif', 'raleway', 'montserrat'];

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return true;
  try {
    let Font = null;
    try {
      Font = Quill.import('formats/font');
    } catch (_) {}
    if (!Font) {
      try {
        Font = Quill.import('attributors/style/font');
      } catch (_) {}
    }
    if (Font) {
      Font.whitelist = fontNames;
      Quill.register(Font, true);
      fontsRegistered = true;
      return true;
    }
    const Parchment = Quill.import('parchment');
    if (Parchment && Parchment.Attributor && Parchment.Attributor.Class) {
      const FontClass = new Parchment.Attributor.Class('font', 'ql-font', { whitelist: fontNames });
      Quill.register(FontClass, true);
      fontsRegistered = true;
      return true;
    }
  } catch (_) {}
  return false;
}

export default function RichTextEditor({ value = '', onChange, placeholder, postId, disabled }) {
  const toolbarRef = useRef(null);
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isInternalChange = useRef(false);

  const uploadImage = useCallback(
    async (file) => {
      if (!imageTypes.includes(file.type)) {
        alert('Chỉ cho phép ảnh: JPG, PNG, GIF, WEBP');
        return null;
      }
      try {
        const res = postId
          ? await apiService.uploadPostImage(postId, file)
          : await apiService.uploadPostTempImage(file);
        if (res?.success && res?.data?.url) return res.data.url;
      } catch (err) {
        console.error('Upload image error:', err);
        alert('Lỗi upload ảnh: ' + (err.message || ''));
      }
      return null;
    },
    [postId]
  );

  const insertImage = useCallback((url) => {
    const q = quillRef.current;
    if (!q) return;
    const range = q.getSelection(true) || { index: q.getLength() };
    q.insertEmbed(range.index, 'image', url, 'user');
    q.setSelection(range.index + 1);
  }, []);

  const handleImageSelect = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (url) insertImage(url);
    };
    input.click();
  }, [uploadImage, insertImage]);

  useEffect(() => {
    if (!toolbarRef.current || !containerRef.current) return;

    // Tránh init hai lần (Strict Mode): nếu container đã có nội dung Quill thì bỏ qua
    if (containerRef.current.querySelector('.ql-editor')) return;

    registerFonts();
    const toolbarRows = [
      [{ font: fontNames }],
      [{ align: [] }],
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link', 'image', 'clean'],
    ];

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder || 'Nhập nội dung...',
      readOnly: disabled,
      modules: {
        toolbar: {
          container: toolbarRows,
          handlers: {
            image: handleImageSelect,
          },
        },
        clipboard: { matchVisual: false },
      },
    });

    quillRef.current = quill;

    // Đưa toolbar ra ngoài container: Quill mặc định chèn toolbar vào đầu containerRef,
    // ta chuyển toolbar vào toolbarRef để chỉ còn 1 toolbar và dễ cleanup
    const toolbarEl = containerRef.current.querySelector('.ql-toolbar');
    if (toolbarEl && toolbarRef.current && !toolbarRef.current.contains(toolbarEl)) {
      toolbarRef.current.appendChild(toolbarEl);
    }

    const onTextChange = () => {
      if (isInternalChange.current) return;
      const html = quill.root.innerHTML;
      onChange(html === '<p><br></p>' ? '' : html);
    };

    quill.on('text-change', onTextChange);

    if (value) {
      isInternalChange.current = true;
      quill.deleteText(0, quill.getLength(), 'silent');
      quill.clipboard.dangerouslyPasteHTML(0, value, 'silent');
      isInternalChange.current = false;
    }

    return () => {
      quill.off('text-change', onTextChange);
      quillRef.current = null;
      if (toolbarRef.current) toolbarRef.current.innerHTML = '';
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const q = quillRef.current;
    if (!q || isInternalChange.current) return;
    const currentHtml = q.root.innerHTML;
    const normalizedValue = value || '';
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;
    if (normalizedValue !== normalizedCurrent) {
      isInternalChange.current = true;
      const sel = q.getSelection();
      q.deleteText(0, q.getLength(), 'silent');
      q.clipboard.dangerouslyPasteHTML(0, normalizedValue, 'silent');
      if (sel) q.setSelection(sel);
      isInternalChange.current = false;
    }
  }, [value]);

  useEffect(() => {
    const q = quillRef.current;
    if (q) q.enable(!disabled);
  }, [disabled]);

  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          e.stopPropagation();
          const file = item.getAsFile();
          if (file) {
            uploadImage(file).then((url) => {
              if (url) insertImage(url);
            });
          }
          return;
        }
      }
    },
    [uploadImage, insertImage]
  );

  return (
    <div
      className="rich-editor-wrapper"
      onPasteCapture={handlePaste}
      style={{ minHeight: 480 }}
    >
      <div ref={toolbarRef} className="rich-editor-toolbar" aria-label="Toolbar" />
      <div ref={containerRef} className="rich-editor-quill" />
    </div>
  );
}
