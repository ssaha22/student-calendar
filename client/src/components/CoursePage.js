import React from "react";
import AppMenu from "./AppMenu";
import { useParams, Redirect } from "react-router";
import { useSelector } from "react-redux";

function CoursePage() {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.user);

  if (!userInfo.userID || !userInfo.authToken) {
    return (
      <Redirect
        to={{ pathname: "/login", state: { redirectedFrom: `/courses/${id}` } }}
      />
    );
  }

  return <AppMenu showSideBar selectedCourseID={parseInt(id)} />;
}

export default CoursePage;
