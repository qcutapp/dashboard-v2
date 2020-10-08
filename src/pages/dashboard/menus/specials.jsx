import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useRouteMatch } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import axios from "axios";
import UploadFile from "components/UploadFile";

import { AppStore } from "store";

// .env
const { REACT_APP_API_ENDPOINT, PUBLIC_URL } = process.env;

export default function Specials() {
  const [specials, setSpecials] = useState([]);
  const [modifySpecial, setModifySpecial] = useState(null);
  const [addSpecial, setAddSpecial] = useState(false);

  const [filter, setFilter] = useState({
    search: "",
  });

  const match = useRouteMatch("/dashboard/menus/:menu_id/specials");
  const menu_id = match.params.menu_id;

  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  useEffect(() => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}/venue/special/${menu_id}`, {
        headers: { authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        setSpecials(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [menu_id, access_token]);

  // Filter specials
  let filteredSpecials = specials.filter((special) => {
    if (!filter.search) return true;

    if (special?.name?.toLowerCase().includes(filter.search.toLowerCase())) {
      return true;
    }

    return false;
  });

  // Sort specials
  filteredSpecials.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm text-right">
          <div
            className="btn btn-primary btn-primary-hover-none btn-lg mb-2"
            onClick={() => setAddSpecial(true)}
          >
            Add Special
            <img
              src={PUBLIC_URL + "/add-icon.png"}
              alt="Add Special"
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
                  <td colSpan="3" style={{ verticalAlign: "bottom" }}>
                    {filteredSpecials.length} Specials Showing
                    {Object.keys(filter).some((i) => filter[i].length) && (
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setFilter({ search: "" })}
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                  <td colSpan="3">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search Specials"
                      value={filter.search}
                      onChange={(e) => {
                        const search = e.target.value;
                        setFilter({ search });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Name</td>
                  <td className="text-muted">Description</td>
                  <td className="text-muted">Total Options</td>
                  <td className="text-muted">Type</td>
                  <td className="text-muted">Price</td>
                </tr>
              </thead>
              <tbody>
                {filteredSpecials.map((special) => (
                  <tr
                    key={special._id}
                    className="shadow rounded-pill"
                    style={{ cursor: "pointer" }}
                    onClick={() => setModifySpecial(special)}
                  >
                    <td>{special.name}</td>
                    <td>{special.description}</td>
                    <td>{special.optionsQuantity || 0}</td>
                    <td>{special.type}</td>
                    <td>£{special.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddOrUpdateSpecial
        show={!!modifySpecial || addSpecial}
        special={modifySpecial}
        onSuccess={({ type, special }) => {
          switch (type) {
            case "add":
              setSpecials((prevSpecials) => [special, ...prevSpecials]);
              break;
            case "update":
              setSpecials((prevSpecials) =>
                prevSpecials.map((s) => {
                  if (s._id === modifySpecial._id) return special;
                  return s;
                })
              );
              break;
            case "delete":
              setSpecials((prevSpecials) =>
                prevSpecials.filter((s) => s._id !== modifySpecial._id)
              );
              break;
            default:
              break;
          }

          setModifySpecial(null);
          setAddSpecial(false);
        }}
        onHide={() => {
          setModifySpecial(null);
          setAddSpecial(false);
        }}
      />
    </div>
  );
}

function AddOrUpdateSpecial({ show, special, onSuccess, onHide }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [optionsQuantity, setOptionsQuantity] = useState("");
  const [options, setOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const match = useRouteMatch("/dashboard/menus/:menu_id/specials");
  const menu_id = match.params.menu_id;

  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  useEffect(() => {
    setName(special?.name || "");
    setType(special?.type || "");
    setPrice(special?.price || "");
    setImage(special?.image || null);
    setOptionsQuantity(special?.optionsQuantity || "");
    setOptions(special?.options || []);
    setDescription(special?.description || "");
  }, [special]);

  const submitSpecial = (requestType) => {
    setIsFetching(true);

    let request;

    switch (requestType) {
      case "add":
        // Add Request
        request = axios.post(
          `${REACT_APP_API_ENDPOINT}/venue/special/${menu_id}`,
          { name, type, price, image, optionsQuantity, options, description },
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      case "update":
        // Update Request
        request = axios.patch(
          `${REACT_APP_API_ENDPOINT}/venue/special/${special._id}`,
          { name, type, price, image, optionsQuantity, options, description },
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      case "delete":
        // Delete Request
        request = axios.delete(
          `${REACT_APP_API_ENDPOINT}/venue/special/${special._id}`,
          {
            headers: { authorization: `Bearer ${access_token}` },
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
          onSuccess({ type: requestType, special: response.data });

          if (requestType === "add") toast.success("Added Special!");
          if (requestType === "update") toast.success("Updated Special!");
          if (requestType === "delete") toast.success("Deleted Special!");
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
          {special ? "Update Special" : "Add Special"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="row my-4">
            <div className="col-8">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-4">
              <label>Price</label>
              <input
                type="text"
                className="form-control"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="row my-4">
            <div className="col-6">
              <label>Type</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="option">Option</option>
                <option value="set">Set</option>
              </select>
            </div>
            <div className="col-4 offset-2">
              <label>Image</label>
              <UploadFile
                initialUrl={image}
                onUpload={(url) => setImage(url)}
              />
            </div>
          </div>
          {type === "option" && (
            <>
              <div className="row my-4">
                <div className="col">
                  <label>Options Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    value={optionsQuantity}
                    onChange={(e) => setOptionsQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className="row my-4">
                <div className="col">
                  <label>Options</label>
                  <OptionsSelector
                    initialOptions={options}
                    onChange={(options) => setOptions(options)}
                  />
                </div>
              </div>
            </>
          )}
          <div className="row my-4">
            <div className="col">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        {special ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => submitSpecial("delete")}
              disabled={isFetching}
            >
              Delete Special
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => submitSpecial("update")}
              disabled={isFetching}
            >
              Update Special
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => submitSpecial("add")}
            disabled={isFetching}
          >
            Save Special
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

AddOrUpdateSpecial.defaultProps = {
  drink: {
    _id: 1,
    name: "Default Name",
    type: "set",
    price: 10,
    image: "https://picsum.photos/200.jpg",
    optionsQuantity: 0,
    options: [],
    description: "Default Description",
  },
  show: false,
  onSuccess: (i) => i,
  onHide: (i) => i,
};

AddOrUpdateSpecial.propTypes = {
  special: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.oneOf(["set", "option"]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    optionsQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
  }),
  show: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func,
  onHide: PropTypes.func,
};

function OptionsSelector({ initialOptions, onChange }) {
  const [selectedOptions, setSelectedOptions] = useState(initialOptions);
  const [availableDrinks, setAvailableDrinks] = useState([]);

  const match = useRouteMatch("/dashboard/menus/:menu_id/specials");
  const menu_id = match.params.menu_id;

  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions, onChange]);

  useEffect(() => {
    // Get drinks
    axios
      .get(`${REACT_APP_API_ENDPOINT}/venue/drink/${menu_id}`, {
        headers: { authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        setAvailableDrinks(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [menu_id, access_token]);

  return [...selectedOptions, ""].map((drinkId, i) => (
    <div className="row" key={i}>
      <div className="col-8">
        <select
          className="form-control"
          value={drinkId || ""}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedOptions((prevSelectedOptions) => {
              const newSelectedDrinks = [...prevSelectedOptions];
              newSelectedDrinks[i] = value;

              return newSelectedDrinks;
            });
          }}
        >
          <option value="">Select Drink</option>
          {availableDrinks.map((menuDrink, j) => (
            <option key={j} value={menuDrink._id}>
              {menuDrink.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-4 d-flex align-items-end">
        {drinkId && (
          <div
            className="btn btn-link btn-sm"
            onClick={() =>
              setSelectedOptions((o) => {
                const newOptions = [...o];
                newOptions.splice(i, 1);
                return newOptions;
              })
            }
          >
            Remove
          </div>
        )}
      </div>
    </div>
  ));
}

OptionsSelector.defaultProps = {
  initialOptions: [],
  onChange: (i) => i,
};

OptionsSelector.propTypes = {
  initialOptions: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};
