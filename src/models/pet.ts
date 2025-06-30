import { Gender } from "../enums/gender";
import { PetType } from "../enums/petType";
import { Size } from "../enums/size";
import { status } from "../enums/status";
import { UserModel } from "./user";

export interface PetModel {
  id: string;
  userId: string;
  breedId: string;
  breed: Breed;
  paymentId: string | null;
  petName: string;
  size: Size;
  petType: PetType;
  bio: string;
  images: string[];
  documentImages: string[];
  price: number;
  yearAge: number;
  monthAge: number;
  color: string;
  weight: number;
  height: number;
  status: status;
  gender: Gender;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: UserModel;
}

export interface Breed {
  id: string;
  breedName: string;
  type: string;
}
