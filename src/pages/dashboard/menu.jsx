import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";

import { AppStore } from "store";

export default function Menu() {
  const [menus, setMenus] = useState([]);
  const [addMenu, setAddMenu] = useState(false);
  const [modifyMenu, setModifyMenu] = useState(null);

  const {
    appState: { user },
  } = useContext(AppStore);

  // fetch: menus
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/menu`, {
        headers: { authorization: `Bearer ${user.access_token}` },
      })
      .then((response) => {
        setMenus(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [user]);

  const activateMenu = (menuId) => {
    axios
      .patch(
        `${process.env.REACT_APP_API_ENDPOINT}/menu/${menuId}/activate`,
        {},
        {
          headers: { authorization: `Bearer ${user.access_token}` },
        }
      )
      .then((response) => {
        setMenus(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  };

  return (
    <div className="container">
      <div className="row mt-3 mb-5">
        <div className="col-sm">
          <h1 className="text-light text-weight-bold">Your Menus</h1>
        </div>
        <div className="col-sm text-right">
          <div
            className="btn btn-primary btn-primary-hover-none btn-lg"
            onClick={() => setAddMenu(true)}
          >
            Add Menu
            <img
              src={process.env.PUBLIC_URL + "/add-icon.png"}
              alt="Add Menu"
              style={{ marginLeft: "1rem", width: "24px" }}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <div className="table-responsive">
            <table className="table table-borderless rounded-pill cards">
              <thead>
                <tr>
                  <td>Available Menus</td>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr
                    className="shadow rounded-pill"
                    key={menu._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setModifyMenu(menu)}
                  >
                    <td>{menu.name}</td>
                    <td className="text-right">
                      {menu.active ? (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          disabled
                          style={{ width: "150px" }}
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            activateMenu(menu._id);
                          }}
                          style={{ width: "150px" }}
                        >
                          Make Active
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddOrModifyMenu
        show={addMenu || !!modifyMenu}
        menu={modifyMenu}
        onHide={() => {
          setAddMenu(false);
          setModifyMenu(false);
        }}
        onSuccess={({ type, menu }) => {
          switch (type) {
            case "add":
              setMenus((prevMenus) => [menu, ...prevMenus]);
              break;
            case "update":
              setMenus((prevMenus) =>
                prevMenus.map((m) => {
                  if (m._id === modifyMenu._id) return menu;
                  return m;
                })
              );
              break;
            case "delete":
              setMenus((prevMenus) =>
                prevMenus.filter((m) => m._id !== modifyMenu._id)
              );
              break;
            default:
              break;
          }

          setAddMenu(false);
          setModifyMenu(false);
        }}
      />
    </div>
  );
}

function AddOrModifyMenu({ show, menu, onHide, onSuccess }) {
  const [modifiedName, setModifiedName] = useState("");
  const [modifiedSpecials, setModifiedSpecials] = useState([]);
  const [modifiedDrinks, setModifiedDrinks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const { appState } = useContext(AppStore);

  useEffect(() => {
    setModifiedName(menu?.name || "");
  }, [menu]);

  const submitMenu = (type) => {
    setIsFetching(true);

    let request;

    switch (type) {
      case "add":
        // Add Request
        request = axios.post(
          `${process.env.REACT_APP_API_ENDPOINT}/menu`,
          {
            name: modifiedName,
            drinks: modifiedDrinks,
            specials: modifiedSpecials,
          },
          {
            headers: { authorization: `Bearer ${appState.user.access_token}` },
          }
        );
        break;
      case "update":
        // Update Request
        request = axios.patch(
          `${process.env.REACT_APP_API_ENDPOINT}/menu/${menu._id}`,
          {
            name: modifiedName,
            drinks: modifiedDrinks,
            specials: modifiedSpecials,
          },
          {
            headers: { authorization: `Bearer ${appState.user.access_token}` },
          }
        );
        break;
      case "delete":
        // Delete Request
        request = axios.delete(
          `${process.env.REACT_APP_API_ENDPOINT}/menu/${menu._id}`,
          {
            headers: { authorization: `Bearer ${appState.user.access_token}` },
          }
        );
        break;
      default:
        break;
    }

    // send request
    request
      .then(
        (response) => {
          onSuccess({ type, menu: response.data });

          if (type === "add") toast.success("Added Menu!");
          if (type === "update") toast.success("Updated Menu!");
          if (type === "delete") toast.success("Deleted Menu!");
        },
        (err) => {
          const message = Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message
                .map((i) => <li>{i.message}</li>)
                .reduce((prev, curr) => [prev, "", curr])
            : err.response?.data?.message || err.message;

          toast.error(<ul className="list-unstyled">{message}</ul>, {
            autoClose: 10000,
          });
        }
      )
      .finally(() => {
        setIsFetching(false);
      });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title className="text-muted">
          {menu ? "Modify Menu" : "Add Menu"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="my-4">
            <label>Menu Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Menu Name"
              value={modifiedName}
              onChange={(e) => setModifiedName(e.target.value)}
            />
          </div>
          <div className="my-4">
            <label className="font-weight-bold">Specials</label>
            <SpecialSelector
              initialSpecials={menu ? menu.specials : []}
              onChange={(specials) => {
                setModifiedSpecials(specials);
              }}
            />
          </div>
          <div className="my-4">
            <label className="font-weight-bold">Drinks</label>
            <DrinkSelector
              initialDrinks={menu?.drinks || []}
              onChange={(drinks) => {
                setModifiedDrinks(drinks);
              }}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        {menu ? (
          <>
            {!menu?.active && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => submitMenu("delete")}
                disabled={isFetching}
              >
                Delete Menu
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => submitMenu("update")}
              disabled={isFetching}
            >
              Update Menu
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => submitMenu("add")}
            disabled={isFetching}
          >
            Save Menu
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

function SpecialSelector({ initialSpecials, onChange }) {
  const [selectedSpecials, setSelectedSpecials] = useState(initialSpecials);

  const {
    appState: { venue },
  } = useContext(AppStore);

  useEffect(() => {
    onChange(selectedSpecials);
  }, [selectedSpecials, onChange]);

  return [...selectedSpecials, ""].map((specialId, i) => (
    <div className="row" key={i}>
      <div className="col-6">
        <select
          className="form-control"
          value={specialId}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedSpecials((prevSelectedSpecials) => {
              const newSelectedSpecials = [...prevSelectedSpecials];
              newSelectedSpecials[i] = value;
              return newSelectedSpecials;
            });
          }}
        >
          <option value="">Select Special</option>
          {venue.specials.map((venueSpecial, j) => (
            <option key={j} value={venueSpecial._id}>
              {venueSpecial.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-3 d-flex align-items-center">
        {specialId && (
          <>
            £
            {venue.specials.some((v) => v._id === specialId)
              ? venue.specials.find((v) => v._id === specialId).price
              : 0.0}
          </>
        )}
      </div>
      <div className="col-3 d-flex align-items-center">
        {specialId && (
          <div
            className="btn btn-link"
            onClick={(e) => {
              setSelectedSpecials((prevSelectedSpecials) =>
                prevSelectedSpecials.filter((_id) => _id !== specialId)
              );
            }}
          >
            Remove
          </div>
        )}
      </div>
    </div>
  ));
}

function DrinkSelector({ initialDrinks, onChange }) {
  const [selectedDrinks, setSelectedDrinks] = useState(initialDrinks);

  const {
    appState: { venue },
  } = useContext(AppStore);

  useEffect(() => {
    onChange(selectedDrinks);
  }, [selectedDrinks, onChange]);

  return [...selectedDrinks, ""].map((drinkId, i) => (
    <div className="row" key={i}>
      <div className="col-6">
        <select
          className="form-control"
          value={drinkId}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedDrinks((prevSelectedDrinks) => {
              const newSelectedDrinks = [...prevSelectedDrinks];
              newSelectedDrinks[i] = value;
              return newSelectedDrinks;
            });
          }}
        >
          <option value="">Select Drink</option>
          {venue.drinks.map((venueDrink, j) => (
            <option key={j} value={venueDrink._id}>
              {venueDrink.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-3 d-flex align-items-center">
        {drinkId && (
          <>
            £
            {venue.drinks.some((d) => d._id === drinkId)
              ? venue.drinks.find((d) => d._id === drinkId).sizes[0]?.price ||
                0.0
              : 0.0}
          </>
        )}
      </div>
      <div className="col-3 d-flex align-items-center justify-content-center">
        {drinkId && (
          <div
            className="btn btn-link"
            onClick={() =>
              setSelectedDrinks((prevSelectedDrinks) =>
                prevSelectedDrinks.filter((_id) => _id !== drinkId)
              )
            }
          >
            Remove
          </div>
        )}
      </div>
    </div>
  ));
}
