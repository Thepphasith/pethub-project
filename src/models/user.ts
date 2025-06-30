import { Gender } from "../enums/gender";

export interface UserModel {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: string;
    roles: string;
    avatar: string;
    village: string;
    DOB: string;
    city: string;
    bio: string;
    tel: string;
    gender: Gender;
}