import React from "react";
import AppMenu from "../components/AppMenu";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

function SettingsPage() {
  const userInfo = useSelector((state) => state.user);

  if (!userInfo.userID || !userInfo.authToken) {
    return (
      <Redirect
        to={{ pathname: "/login", state: { redirectedFrom: "/settings" } }}
      />
    );
  }

  return <AppMenu showSideBar selected="Settings" />;
}

export default SettingsPage;
