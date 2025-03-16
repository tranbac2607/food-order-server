export interface Food {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  image?: string;
  available?: boolean;
}
