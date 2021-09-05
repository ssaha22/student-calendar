import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/userSlice";
import { useHistory, Redirect } from "react-router-dom";
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Typography,
  Container,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { LockOutlined, Visibility, VisibilityOff } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import AppMenu from "../components/AppMenu";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(15),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
  },
}));

function SignupPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const userInfo = useSelector((state) => state.user);
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  }

  function handleClickShowPassword() {
    setShowPassword(!showPassword);
  }

  async function handlSignup(e) {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/register`,
        user
      );
      dispatch(login(res.data));
      history.push("/schedule");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message);
      } else {
        setError("Error creating account");
      }
    }
  }

  if (userInfo.userID && userInfo.authToken) {
    return <Redirect to="/schedule" />;
  }

  return (
    <>
      <AppMenu showLoginAndSignup />
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <form className={classes.form} onSubmit={handlSignup} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={user.email}
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={user.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography className={classes.errorMessage}>{error}</Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={!user.email || !user.password}
            >
              Sign Up
            </Button>
            <Grid justifyContent="center" container>
              <Grid item>
                <Typography>
                  Already have an account?&nbsp;
                  <Link href="/login">Log in</Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    </>
  );
}

export default SignupPage;
