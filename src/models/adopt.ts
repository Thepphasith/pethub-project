import { PetModel } from "./pet";
import { UserModel } from "./user";

export interface HouseDetails {
  id: string;
  userId: string;
  petId: string;
  paymentId: string | null;
  houseImages: string[];
  houseDetails: string;
  adults: number;
  children: number;
  allergies: boolean;
  otherPets: boolean;
  user: UserModel;
  otherPetsDetails: string;
  neutered: boolean;
  acceptStatus: "PENDING" | "ACCEPTED" | "REJECTED" ;
  createdAt: string;
  updatedAt: string;
  pet: PetModel;
}
