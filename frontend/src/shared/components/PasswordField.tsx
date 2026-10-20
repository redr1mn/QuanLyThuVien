import { useId, useState } from 'react';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
};

export function PasswordField({ label, value, onChange, autoComplete, error }: PasswordFieldProps) {
  const id = useId();
  const [isVisible, setVisible] = useState(false);
  return <div className="form-field">
    <label htmlFor={id}>{label}</label>
    <div className="password-field-wrap">
      <input id={id} type={isVisible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      <button className="password-toggle" type="button" aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setVisible(value => !value)}>{isVisible ? 'Ẩn' : 'Hiện'}</button>
    </div>
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>;
}
