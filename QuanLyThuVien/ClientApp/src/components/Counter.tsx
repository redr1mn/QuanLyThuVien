import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  title?: string;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0, title = 'React Counter Component' }) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <div className="card shadow-sm border-0 my-3">
      <div className="card-body">
        <h5 className="card-title text-primary d-flex align-items-center gap-2">
          <span>⚛️</span> {title}
        </h5>
        <p className="card-text text-muted mb-3">
          Component này được render hoàn toàn bằng <strong>React 18</strong> + <strong>TypeScript</strong> bên trong Razor View.
        </p>
        <div className="d-flex align-items-center gap-3">
          <button 
            type="button" 
            className="btn btn-outline-danger btn-sm px-3"
            onClick={() => setCount((prev) => prev - 1)}
          >
            - Giảm
          </button>
          <span className="badge bg-primary fs-5 px-3 py-2">
            Giá trị: {count}
          </span>
          <button 
            type="button" 
            className="btn btn-outline-success btn-sm px-3"
            onClick={() => setCount((prev) => prev + 1)}
          >
            + Tăng
          </button>
          <button 
            type="button" 
            className="btn btn-link text-secondary btn-sm"
            onClick={() => setCount(initialCount)}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Counter;
