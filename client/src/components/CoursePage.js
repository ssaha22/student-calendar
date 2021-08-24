import React from "react";
import AppMenu from "./AppMenu";
import { useParams } from "react-router";

function CoursePage() {
  const { id } = useParams();
  return <AppMenu showSideBar={true} selectedCourseID={parseInt(id)} />;
}

export default CoursePage;
