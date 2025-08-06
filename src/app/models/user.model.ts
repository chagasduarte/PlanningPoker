export interface User {
  id: string;
  name: string;
  role: 'voter' | 'observer';
  card?: string;
}
