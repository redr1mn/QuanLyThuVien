import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BookCatalog from './components/BookCatalog';
import Workspace from './components/Workspace';

// Chỉ mount component đã đăng ký; tên lấy từ HTML không được dùng để import mã tùy ý.
const componentRegistry: Record<string, React.ComponentType<any>> = {
  BookCatalog,
  Workspace,
};

function mountAutoComponents() {
  const elements = document.querySelectorAll<HTMLElement>('[data-react-component]');

  elements.forEach((el) => {
    // Giữ lại root đã mount nếu hàm bị gọi lại, tránh tạo nhiều React root trên cùng một phần tử.
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

// Script có thể chạy trước hoặc sau DOMContentLoaded, nên cần xử lý cả hai thời điểm.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAutoComponents);
} else {
  mountAutoComponents();
}

// Dành cho container được Razor/script thêm sau lần quét ban đầu; bên gọi phải tránh mount lại cùng container.
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
