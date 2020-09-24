import React, { useEffect, useContext, useState } from "react";
import {
  Switch,
  Route,
  useRouteMatch,
  NavLink,
  Redirect,
} from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import { AppStore } from "store";

import Drinks from "pages/dashboard/drinks";
import Specials from "pages/dashboard/specials";
import Menu from "pages/dashboard/menu";
import Orders from "pages/dashboard/orders";

export default function Dashboard() {
  const match = useRouteMatch();
  const [isFetching, setIsFetching] = useState(true);
  const [todaysTakings, setTodaysTakings] = useState(0);

  const {
    appState: { user, venue },
    appDispatch,
  } = useContext(AppStore);

  // Fetch: Venue details
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/venue/me`, {
        headers: { authorization: `Bearer ${user.access_token}` },
      })
      .then(async (response) => {
        // Update appState
        appDispatch({ type: "VENUE:SET", payload: response.data });

        // Fetch: Todays Takings
        return axios
          .get(`${process.env.REACT_APP_API_ENDPOINT}/venue/takings`, {
            headers: { authorization: `Bearer ${user.access_token}` },
          })
          .then((response) => {
            // Update todaysTakings
            setTodaysTakings(response.data.sum?.[0]?.total || 0);
          });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [user, appDispatch]);

  // Loading
  if (isFetching) return null;

  // No Venues
  if (Object.keys(venue).length === 0) {
    return (
      <div>
        Your account does not belong to any venue. Please contact the
        administrator.
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        <div className="sidebar col-sm col-md-3 col-lg-2 d-flex flex-column h-100">
          <div className="d-flex align-items-center my-3 pb-3 text-white-50 divider-line-dark">
            <div
              className="venue-logo"
              style={{ backgroundImage: `url(${venue.logo})` }}
            ></div>
            <div className="ml-2">
              <h5 className="m-0">{venue.name}</h5>
              <small className="font-weight-light text-muted m-0">
                {user.name}
              </small>
            </div>
          </div>
          <ul className="nav flex-column flex-grow-1">
            <li className="nav-link p-0 my-2">
              <NavLink
                className="btn btn-block text-left text-white-50"
                activeClassName="nav-link-active"
                to={`${match.url}/drinks`}
              >
                Drinks
              </NavLink>
            </li>
            <li className="nav-link p-0 my-2">
              <NavLink
                className="btn btn-block text-left text-white-50"
                activeClassName="nav-link-active"
                to={`${match.url}/specials`}
              >
                Specials
              </NavLink>
            </li>
            <li className="nav-link p-0 my-2">
              <NavLink
                className="btn btn-block text-left text-white-50"
                activeClassName="nav-link-active"
                to={`${match.url}/menu`}
              >
                Menus
              </NavLink>
            </li>
            <li className="nav-link p-0 my-2">
              <NavLink
                className="btn btn-block text-left text-white-50"
                activeClassName="nav-link-active"
                to={`${match.url}/orders`}
              >
                Orders
              </NavLink>
            </li>
            <li className="nav-link p-0 my-2">
              <a
                className="btn btn-block text-left text-white-50"
                href={
                  venue.stripeLoginLink || "https://connect.stripe.com/login"
                }
                target="new"
              >
                Stripe
              </a>
            </li>
          </ul>
          <ul className="nav flex-column">
            <li className="nav-link divider-line-dark">
              <h1 className="text-center text-light font-weight-light">
                £{parseFloat(todaysTakings).toFixed(2)}
              </h1>
              <div className="text-center text-white-50">Today's Takings</div>
            </li>
            <li className="nav-link">
              <div
                className="btn btn-block text-center btn-link"
                onClick={() => appDispatch({ type: "USER:UNSET" })}
              >
                Logout
              </div>
            </li>
          </ul>
        </div>
        <div className="main col-sm col-md-9 col-lg-10 h-100 px-4">
          <Switch>
            <Route path={`${match.path}/drinks`} component={Drinks}></Route>
            <Route path={`${match.path}/specials`} component={Specials}></Route>
            <Route path={`${match.path}/menu`} component={Menu}></Route>
            <Route path={`${match.path}/orders`} component={Orders}></Route>
            {/* Default */}
            <Route
              path="/"
              render={() => <Redirect to={`${match.path}/orders`} />}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
}
