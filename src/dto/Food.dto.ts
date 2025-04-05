export interface CreateFoodInputs {
  _id: string;
  name: string;
  description: string;
  foodType: string;
  category: string;
  readyTime: [number];
  price: [number];
}
