import React, { useEffect, useState, useContext } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";

import { AppStore } from "store";

const { REACT_APP_API_ENDPOINT, PUBLIC_URL } = process.env;

export default function Menu() {
  const [menus, setMenus] = useState([]);
  const [addMenu, setAddMenu] = useState(false);
  const [modifyMenu, setModifyMenu] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const history = useHistory();
  const match = useRouteMatch();

  const {
    appState: {
      user: { access_token },
    },
    appDispatch,
  } = useContext(AppStore);

  useEffect(() => {
    appDispatch({ type: "VENUE:UPDATE", payload: { menus } });
  }, [menus, appDispatch]);

  // fetch: menus
  useEffect(() => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}/menu`, {
        headers: { authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        setMenus(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [access_token]);

  // handle: activate menu
  const activateMenu = (menuId) => {
    setIsFetching(true);

    axios
      .patch(
        `${REACT_APP_API_ENDPOINT}/menu/${menuId}/activate`,
        {},
        {
          headers: { authorization: `Bearer ${access_token}` },
        }
      )
      .then((response) => {
        setMenus(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  // handle: copy menu
  const copyMenu = (menuId) => {
    setIsFetching(true);

    axios
      .post(
        `${REACT_APP_API_ENDPOINT}/menu/${menuId}/copy`,
        {},
        {
          headers: { authorization: `Bearer ${access_token}` },
        }
      )
      .then((response) => {
        setMenus((prevMenus) => [...prevMenus, response.data]);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setIsFetching(false);
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
              src={PUBLIC_URL + "/add-icon.png"}
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
                    onClick={() => history.push(`${match.path}/${menu._id}`)}
                  >
                    <td>{menu.name}</td>
                    <td className="text-right">
                      <button
                        className="btn btn-link btn-sm"
                        style={{ marginRight: "2rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModifyMenu(menu);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-link btn-sm"
                        style={{ marginRight: "2rem" }}
                        disabled={isFetching}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyMenu(menu._id);
                        }}
                      >
                        Copy
                      </button>

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
                          disabled={isFetching}
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
  const [name, setName] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  useEffect(() => {
    setName(menu?.name || "");
  }, [menu]);

  const submitMenu = (type) => {
    setIsFetching(true);

    let request;

    switch (type) {
      case "add":
        // Add Request
        request = axios.post(
          `${REACT_APP_API_ENDPOINT}/menu`,
          {
            name: name,
          },
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      case "update":
        // Update Request
        request = axios.patch(
          `${REACT_APP_API_ENDPOINT}/menu/${menu._id}`,
          {
            name: name,
          },
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      case "delete":
        // Delete Request
        request = axios.delete(`${REACT_APP_API_ENDPOINT}/menu/${menu._id}`, {
          headers: { authorization: `Bearer ${access_token}` },
        });
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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            Create Menu
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
