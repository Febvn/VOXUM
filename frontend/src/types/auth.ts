export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'voxtum';
  plan?: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

