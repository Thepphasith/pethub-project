import { PetModel } from "./pet";

export interface FavoriteModel {
    id: string;
    itemId: string;
    items: PetModel;
    createdAt: string;
    updatedAt: string;
}