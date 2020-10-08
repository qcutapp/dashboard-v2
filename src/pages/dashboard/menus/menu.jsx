import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Switch,
  Route,
  Redirect,
  NavLink,
  useRouteMatch,
} from "react-router-dom";

import { AppStore } from "store";

import Drinks from "pages/dashboard/menus/drinks";
import Specials from "pages/dashboard/menus/specials";

// .env
const { REACT_APP_API_ENDPOINT } = process.env;

export default function Menu() {
  const [menu, setMenu] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const match = useRouteMatch();
  const menu_id = match.params.menu_id;

  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  // fetch menu
  useEffect(() => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}/menu/${menu_id}`, {
        headers: { authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        setMenu(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [menu_id, access_token]);

  // render
  if (isFetching) return null;

  if (!menu)
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <p className="my-3 lead text-light">Menu does not exist!</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="row align-items-center mt-3 mb-5">
        <div className="col">
          <h1 className="text-light text-weight-bold">
            {menu?.name || "Untitled Menu"}
          </h1>
        </div>
        <div className="col text-right">
          <div
            className="d-inline-block bg-light"
            style={{ borderRadius: "2rem" }}
          >
            <NavLink
              className="btn btn-light box-shadow-0"
              style={{ borderRadius: "2rem" }}
              to={`${match.url}/drinks`}
            >
              Drinks
            </NavLink>
            <NavLink
              className="btn btn-light box-shadow-0"
              style={{ borderRadius: "2rem" }}
              to={`${match.url}/specials`}
            >
              Specials
            </NavLink>
          </div>
        </div>
      </div>
      <Switch>
        <Route path={`${match.url}/drinks`} component={Drinks} />
        <Route path={`${match.url}/specials`} component={Specials} />
        {/* Default */}
        <Route
          path="/"
          render={() => <Redirect to={`${match.url}/drinks`} />}
        />
      </Switch>
    </div>
  );
}
