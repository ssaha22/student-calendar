import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import CoursePage from "./pages/CoursePage";
import NewCoursePage from "./pages/NewCoursePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route exact path="/signup">
          <SignupPage />
        </Route>
        <Route exact path="/login">
          <LoginPage />
        </Route>
        <Route exact path="/schedule">
          <SchedulePage />
        </Route>
        <Route exact path="/courses/:id">
          <CoursePage />
        </Route>
        <Route exact path="/new-course">
          <NewCoursePage />
        </Route>
        <Route exact path="/settings">
          <SettingsPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
