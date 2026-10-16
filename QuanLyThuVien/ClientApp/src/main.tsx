import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Counter from './components/Counter';
import BookManager from './components/BookManager';

// Danh sách các React components có thể nhúng vào Razor Views
const componentRegistry: Record<string, React.ComponentType<any>> = {
  Counter,
  BookManager,
};

// Hàm tự động mount các components theo thuộc tính data-react-component
function mountAutoComponents() {
  const elements = document.querySelectorAll<HTMLElement>('[data-react-component]');

  elements.forEach((el) => {
    // Tránh mount lặp lại
    if (el.dataset.reactMounted === 'true') return;

    const componentName = el.getAttribute('data-react-component');
    if (!componentName || !componentRegistry[componentName]) {
      console.warn(`[React] Không tìm thấy component có tên "${componentName}" trong registry.`);
      return;
    }

    const Component = componentRegistry[componentName];
    let props = {};

    const propsAttr = el.getAttribute('data-props');
    if (propsAttr) {
      try {
        props = JSON.parse(propsAttr);
      } catch (err) {
        console.error(`[React] Lỗi parse data-props cho ${componentName}:`, err);
      }
    }

    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <Component {...props} />
      </React.StrictMode>
    );

    el.dataset.reactMounted = 'true';
  });
}

// Khởi chạy khi DOM đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAutoComponents);
} else {
  mountAutoComponents();
}

// Xuất ra window để có thể gọi thủ công từ script Razor nếu cần
declare global {
  interface Window {
    mountReactComponent?: (name: string, containerId: string, props?: any) => void;
  }
}

window.mountReactComponent = (name: string, containerId: string, props: any = {}) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`[React] Không tìm thấy phần tử với id "${containerId}"`);
    return;
  }
  const Component = componentRegistry[name];
  if (!Component) {
    console.error(`[React] Không tìm thấy component "${name}"`);
    return;
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Component {...props} />
    </React.StrictMode>
  );
};
