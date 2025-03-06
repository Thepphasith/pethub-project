import MainLayout from "../layout";
import NotFoundPage from "../pages/404";
import ArticlePage from "../pages/article";
import Company_searchPage from "../pages/company_search";
import HomePage from "../pages/home";
import JobSearchPage from "../pages/job_search";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import { ARTICLE_PATH, COMPANY_SEARCH_PATH, HOME_PATH, JOB_PATH, LOGIN_PATH, REGISTER_PATH } from "./path";
import { useRoutes } from "react-router-dom";

const RoutesComponent = () => {
  return useRoutes([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: HOME_PATH, element: <HomePage /> },
        { path: JOB_PATH, element: <JobSearchPage /> },
        { path: COMPANY_SEARCH_PATH, element: <Company_searchPage /> },
        { path: ARTICLE_PATH, element: <ArticlePage /> },
        { path: LOGIN_PATH, element: <LoginPage /> },
        { path: REGISTER_PATH, element: <RegisterPage /> },
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ]);
};

export default RoutesComponent;
