import { isArray, isEmpty, isString } from 'lodash-es';
import type { LabelValue } from '@/types/content';

export const dealLabel = (label: LabelValue): string[] => {
  if (isEmpty(label)) {
    return [];
  }

  if (isString(label)) {
    return label
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (isArray(label)) {
    return label.map((item) => item.trim()).filter(Boolean);
  }

  return [];
};
