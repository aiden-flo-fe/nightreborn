import { v4 as uuidv4 } from 'uuid';
import type { Ingredient } from '~/types';

// UUID 생성
export const generateId = (): string => uuidv4();

// 현재 시간을 ISO 문자열로 반환
export const getCurrentTime = (): string => new Date().toISOString();

// 재료 양(amount) 파싱 함수
export const parseAmount = (
  amountString: string
): { amountNumber: number | null; amountUnit: string | null } => {
  if (!amountString.trim()) {
    return { amountNumber: null, amountUnit: null };
  }

  // 숫자와 단위를 분리하는 정규식
  const match = amountString.match(/^(\d*\.?\d+)\s*(.*)$/);

  if (match) {
    const [, numberPart, unitPart] = match;
    return {
      amountNumber: parseFloat(numberPart),
      amountUnit: unitPart.trim() || null,
    };
  }

  // 숫자가 없는 경우 전체를 단위로 취급
  return {
    amountNumber: null,
    amountUnit: amountString.trim(),
  };
};

// 재료 양을 인분에 맞게 계산하는 함수
export const calculateIngredientAmount = (
  ingredient: Ingredient,
  servings: number
): string => {
  const { amountNumber, amountUnit } = ingredient;

  if (amountNumber === null) {
    // 숫자가 없는 경우 단위만 반환
    return amountUnit || '';
  }

  const calculatedNumber = amountNumber * servings;
  const formattedNumber = formatNumber(calculatedNumber);

  if (amountUnit) {
    return `${formattedNumber}${amountUnit}`;
  }

  return formattedNumber;
};

// 숫자 포맷팅 함수 (소수점 2자리까지, 불필요한 0 제거)
export const formatNumber = (num: number): string => {
  const formatted = num.toFixed(2);
  return parseFloat(formatted).toString();
};

// 이미지를 Base64로 변환하는 함수
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('파일을 Base64로 변환하는데 실패했습니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는데 실패했습니다.'));
    };

    reader.readAsDataURL(file);
  });
};

// 확인 다이얼로그 함수
export const confirm = (message: string): boolean => {
  return window.confirm(message);
};

// 배열 요소를 새로운 위치로 이동시키는 함수 (드래그앤드롭용)
export const reorderArray = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const result = Array.from(array);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

// 카테고리별 레시피를 정렬하는 함수
export const sortRecipesByOrder = (recipes: any[]): any[] => {
  return [...recipes].sort((a, b) => a.order - b.order);
};

// 카테고리를 정렬하는 함수
export const sortCategoriesByOrder = (categories: any[]): any[] => {
  return [...categories].sort((a, b) => a.order - b.order);
};
