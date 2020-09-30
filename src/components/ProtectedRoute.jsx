import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";

import { AppStore } from "store";

export default function ProtectedRoute(props) {
  const { appState } = useContext(AppStore);

  // Strictly "public" or "user" role.
  if (
    (props.requiredRole === "public" && appState.user._id) ||
    (props.requiredRole === "user" && !appState.user._id)
  ) {
    return <Redirect to={props.redirect} />;
  }

  return <Route {...props} />;
}

ProtectedRoute.defaultProps = {
  requiredRole: "public",
  redirect: "/",
};

ProtectedRoute.propTypes = {
  requiredRole: PropTypes.oneOf(["public", "user"]),
  redirect: PropTypes.string,
};
