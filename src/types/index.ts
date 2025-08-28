export type Category = {
  id: string; // uuid
  name: string;
  order: number;
};

export type Ingredient = {
  id: string; // uuid
  name: string;
  amountNumber: number | null; // 숫자 부분 (예: 1.5)
  amountUnit: string | null; // 숫자 이외 부분 (예: '큰술')
};

export type Recipe = {
  id: string; // uuid
  title: string;
  photo?: string; // base64 또는 로컬 URL
  categoryId: string | null;
  ingredients: Ingredient[]; // 1인분 기준
  order: number; // 카테고리 내 노출 순서
  createdAt: string;
  updatedAt?: string;
};

export type AppData = {
  categories: Category[];
  recipes: Recipe[];
};

// 컴포넌트 Props 타입들
export type RecipeCardProps = {
  recipe: Recipe;
  category?: Category;
  onClick: (recipe: Recipe) => void;
};

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
};

export type InputProps = {
  type?: 'text' | 'number' | 'file';
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
  onFileChange?: (file: File | null) => void;
  label?: string;
  error?: string;
};

export type CategoryModalMode = 'default' | 'sort';

export type DragItem = {
  id: string;
  index: number;
  type: 'category' | 'recipe';
};
