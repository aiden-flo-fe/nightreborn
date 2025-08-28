import type { Category } from '~/types';

export interface CategorySettingsModalProps {
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
  sortMode?: boolean;
  isOpen: boolean;
}

export interface CategoryFormData {
  name: string;
}
