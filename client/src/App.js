import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import SchedulePage from "./components/SchedulePage";
import CoursePage from "./components/CoursePage";
import SettingsPage from "./components/SettingsPage";

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
        <Route exact path="/settings">
          <SettingsPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
