import React from "react";
import AppMenu from "./AppMenu";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

function HomePage() {
  const userInfo = useSelector((state) => state.user);

  if (userInfo.userID && userInfo.authToken) {
    return <Redirect to="/schedule" />;
  }

  return <AppMenu showLoginAndSignup />;
}

export default HomePage;
