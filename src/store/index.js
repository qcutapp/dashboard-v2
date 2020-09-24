import React, { createContext, useReducer } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

// Define context
const AppStore = createContext();

const reducer = (state, action) => {
  const newState = { ...state };
  const { type, payload } = action;

  // Actions
  switch (type) {
    case "USER:SET":
      // Set cookie
      Cookies.set("token", payload.access_token);

      newState.user = payload;

      // Welcome
      toast.success(`Welcome ${newState.user.name}!`);
      break;

    case "USER:UNSET":
      // Remove cookie
      Cookies.remove("token");

      newState.user = {};

      // Bye
      toast.success(`You've been logged out!`);
      break;
    case "VENUE:SET":
      newState.venue = payload;
      break;
    case "VENUE:ADD_OR_UPDATE":
      if (payload.drink) {
        if (newState.venue.drinks.some((d) => d._id === payload.drink._id)) {
          newState.venue.drinks = newState.venue.drinks.map((d) => {
            if (d._id === payload.drink._id) return payload.drink;
            return d;
          });
        } else {
          newState.venue.drinks.unshift(payload.drink);
        }
      }
      if (payload.special) {
        if (
          newState.venue.specials.some((s) => s._id === payload.special._id)
        ) {
          newState.venue.specials = newState.venue.specials.map((s) => {
            if (s._id === payload.special._id) return payload.special;
            return s;
          });
        } else {
          newState.venue.specials.unshift(payload.special);
        }
      }
      break;
    case "VENUE:DELETE":
      if (payload.drink) {
        newState.venue.drinks = newState.venue.drinks.filter(
          (d) => d._id !== payload.drink._id
        );
      }
      if (payload.special) {
        newState.venue.specials = newState.venue.specials.filter(
          (s) => s._id !== payload.special._id
        );
      }

      break;
    default:
      break;
  }

  return newState;
};

// Define provider
const AppProvider = ({ children }) => {
  const [appState, appDispatch] = useReducer(reducer, { user: {}, venue: {} });

  return (
    <AppStore.Provider value={{ appState, appDispatch }}>
      {children}
    </AppStore.Provider>
  );
};

export { AppStore, AppProvider };
