export interface InputProps {
  type?: 'text' | 'number' | 'file';
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
  onFileChange?: (file: File | null) => void;
  onEnterPress?: () => void; // Enter 키 눌렀을 때 실행할 함수
  label?: string;
  error?: string;
  required?: boolean;
  accept?: string; // file input용
  fullWidth?: boolean;
  rows?: number; // textarea용
  multiline?: boolean;
}
