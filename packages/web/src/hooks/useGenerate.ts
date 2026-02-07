import { useState, useCallback } from 'react';
import type { GeneratedContent } from '@boggart/shared';
import { api } from '../api/client';

export function useGenerate() {
  const [brands, setBrands] = useState<GeneratedContent[]>([]);
  const [customContent, setCustomContent] = useState<GeneratedContent[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);

  const generateBrands = useCallback(() => {
    setLoadingBrands(true);
    api.generate.brands()
      .then((res) => setBrands(res.brands))
      .catch(() => {})
      .finally(() => setLoadingBrands(false));
  }, []);

  const generateCustom = useCallback((goal: string) => {
    setLoadingCustom(true);
    api.generate.create(goal)
      .then((res) => setCustomContent((prev) => [...prev, res.content]))
      .catch(() => {})
      .finally(() => setLoadingCustom(false));
  }, []);

  return { brands, customContent, loadingBrands, loadingCustom, generateBrands, generateCustom };
}
