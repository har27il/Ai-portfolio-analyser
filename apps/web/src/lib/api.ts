const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Portfolio endpoints
  getPortfolios() {
    return this.request<{ portfolios: any[] }>('/v1/portfolios');
  }

  getPortfolio(id: string) {
    return this.request<any>(`/v1/portfolios/${id}`);
  }

  createPortfolio(data: { name: string; description?: string }) {
    return this.request<any>('/v1/portfolios', { method: 'POST', body: JSON.stringify(data) });
  }

  uploadPortfolio(id: string, file: File, broker?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (broker) formData.append('broker', broker);

    return fetch(`${this.baseUrl}/v1/portfolios/${id}/upload`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    }).then(r => r.json());
  }

  // Analysis endpoints
  getHealthScore(portfolioId: string) {
    return this.request<any>(`/v1/portfolios/${portfolioId}/analysis/health`);
  }

  getSectorAnalysis(portfolioId: string) {
    return this.request<any>(`/v1/portfolios/${portfolioId}/analysis/sectors`);
  }

  getOverlapAnalysis(portfolioId: string) {
    return this.request<any>(`/v1/portfolios/${portfolioId}/analysis/overlap`);
  }

  getExpenseAudit(portfolioId: string) {
    return this.request<any>(`/v1/portfolios/${portfolioId}/analysis/expenses`);
  }

  // Chat endpoints
  getConversations() {
    return this.request<{ conversations: any[] }>('/v1/conversations');
  }

  createConversation(portfolioId?: string) {
    return this.request<any>('/v1/conversations', {
      method: 'POST',
      body: JSON.stringify({ portfolioId }),
    });
  }

  sendMessage(conversationId: string, content: string) {
    return this.request<any>(`/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Market endpoints
  searchSecurities(query: string) {
    return this.request<{ results: any[] }>(`/v1/market/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiClient(API_URL);
