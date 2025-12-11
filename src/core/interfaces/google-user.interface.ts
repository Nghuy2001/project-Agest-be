export interface GoogleUser {
  email: string;
  name: string;
  avatar?: string;
  provider: 'google';
  providerId: string;
}