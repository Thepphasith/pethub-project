import MainLayout from "../layout";
import NotFoundPage from "../pages/404";
import Company_searchPage from "../pages/company_search";
import BlogProfile from "../pages/Profile/BlogProfile";
import HomePage from "../pages/home";
import JobSearchPage from "../pages/job_search";
import PetDetail from "../pages/job_search/components/AdoptDetail";
import PetAdoptionForm from "../pages/job_search/components/AdoptInformation";
import {
  BLOG_PATH,
  BLOG_PROFILE_PATH,
  HOME_PATH,
  ADOPT_PROFILE_PATH,
  REQUEST_PROFILE_PATH,
  SELL_PATH,
  PET_PATH,
} from "./path";
import { useRoutes } from "react-router-dom";
import PetAdoptionApp from "../pages/Profile/Adopt";
import PetAdoptionRequests from "../pages/Profile/Request";
import PetRehomingApp from "../pages/job_search/components/SellStep/Sell";
import BlogPostDetail from "../pages/company_search/components/DetailPost";
import UserProfilePage from "../pages/Profile/another guy/anotherUserProfile";
import PetEditPage from "../pages/Profile/PetEdit";


const RoutesComponent = () => {
  return useRoutes([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: HOME_PATH, element: <HomePage /> },
        { path: PET_PATH, element: <JobSearchPage /> },
        { path: BLOG_PATH, element: <Company_searchPage /> },
        { path: "/Adopt-information/:id", element: <PetAdoptionForm /> },
        { path: SELL_PATH, element: <PetRehomingApp /> },
        { path: "/adopt-detail/:id", element: <PetDetail /> },
        { path: BLOG_PROFILE_PATH, element: <BlogProfile /> },
        { path: ADOPT_PROFILE_PATH, element: <PetAdoptionApp /> },
        { path: REQUEST_PROFILE_PATH, element: <PetAdoptionRequests /> },
         { path: "/blog-detail/:id", element: <BlogPostDetail /> },
        {path: "/Adopt-detail/:id", element: <PetDetail />},
        {path: "/user-profile/:id", element: < UserProfilePage/>},
        {path: "/edit-pet/:id", element: <PetEditPage/>},
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);
};

export default RoutesComponent;
