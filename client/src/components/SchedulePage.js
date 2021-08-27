import React from "react";
import AppMenu from "./AppMenu";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

function SchedulePage() {
  const userInfo = useSelector((state) => state.user);

  if (!userInfo.userID || !userInfo.authToken) {
    return <Redirect to="/login" />;
  }

  return <AppMenu showSideBar selected="Schedule" />;
}

export default SchedulePage;
