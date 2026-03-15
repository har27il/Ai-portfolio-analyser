import { create } from 'zustand';
import type { Portfolio, Holding } from '@portfolio/shared';

interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  setPortfolios: (portfolios: Portfolio[]) => void;
  setActivePortfolio: (portfolio: Portfolio | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  activePortfolio: null,
  isLoading: false,
  error: null,
  setPortfolios: (portfolios) => set({ portfolios }),
  setActivePortfolio: (portfolio) => set({ activePortfolio: portfolio }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
