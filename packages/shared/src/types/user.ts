export interface User {
  id: string;
  email: string;
  name: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  preferredCurrency: 'INR' | 'USD';
  benchmarks: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
  };
}
