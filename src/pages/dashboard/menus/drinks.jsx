import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useRouteMatch } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { AppStore } from "store";

import Modal from "react-bootstrap/Modal";
import UploadFile from "components/UploadFile";

// .env
const { REACT_APP_API_ENDPOINT, PUBLIC_URL } = process.env;

// Category icons
const categoryIcons = {
  Shots: PUBLIC_URL + "/drinks/Grey-Shots-Icon.svg",
  Spirits: PUBLIC_URL + "/drinks/Grey-Spirit-Icon.svg",
  Cocktails: PUBLIC_URL + "/drinks/Grey-Cocktail-Icon.svg",
  Wines: PUBLIC_URL + "/drinks/Grey-Wine-Icon.svg",
  Beers: PUBLIC_URL + "/drinks/Grey-beer-Icon.svg",
  Ciders: PUBLIC_URL + "/drinks/Grey-Cider-Icon.svg",
  "Soft Drinks": PUBLIC_URL + "/drinks/Grey-SoftDrink-Icon.svg",
  "Hot Drinks": PUBLIC_URL + "/drinks/Grey-Hot-Icon.svg",
  Sparkling: PUBLIC_URL + "/drinks/Grey-Sparkling-Icon.svg",
  Bottles: PUBLIC_URL + "/drinks/Grey-Bottles-Icon.svg",
  Alcopops: PUBLIC_URL + "/drinks/Grey-Alcopops-Icon.svg",
  Liquers: PUBLIC_URL + "/drinks/Grey-Liquors-Icon.svg",
  default: PUBLIC_URL + "/drinks/Grey-Shots-Icon.svg",
};

export default function Drinks() {
  const [drinks, setDrinks] = useState([]);
  const [drinkCategories, setMenuDrinkCategories] = useState([]);
  const [addDrink, setAddDrink] = useState(false);
  const [modifyDrink, setModifyDrink] = useState(null);
  const [filter, setFilter] = useState({
    category: [],
    search: "",
  });

  const match = useRouteMatch("/dashboard/menus/:menu_id/drinks");
  const menu_id = match.params.menu_id;

  // App state
  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  // fetch: drinks
  useEffect(() => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}/venue/drink/${menu_id}`, {
        headers: { authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        setDrinks(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [menu_id, access_token]);

  // fetch: categories
  useEffect(() => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}/menu/${menu_id}/categories`, {
        headers: { authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        setMenuDrinkCategories(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [menu_id, access_token, drinks]);

  // Filter drinks
  let filteredDrinks = drinks
    .filter((drink) => !drink.deleted)
    .filter((drink) => {
      if (!filter.category.length && !filter.search) return true;

      if (filter.category.length && filter.category.includes(drink?.category)) {
        return true;
      }

      if (
        filter.search &&
        drink?.name?.toLowerCase().includes(filter.search.toLowerCase())
      ) {
        return true;
      }

      return false;
    });

  // Sort drinks
  filteredDrinks.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));

  return (
    <>
      <div className="row">
        <div className="col-sm text-right">
          <div
            className="btn btn-primary btn-primary-hover-none btn-lg"
            onClick={() => setAddDrink(true)}
          >
            Add Drink
            <img
              src={PUBLIC_URL + "/add-icon.png"}
              alt="Add Drink"
              style={{ marginLeft: "1rem", width: "24px" }}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm">
          <div className="btn-group btn-group-sm w-100" role="group">
            <button
              type="button"
              className={`btn btn-primary btn-primary-hover-none btn-primary-focus-none btn-primary-active-none text-height-lg ${
                !filter.category.length && "font-weight-bold text-lg"
              }`}
              onClick={() => setFilter({ search: "", category: [] })}
            >
              All
            </button>
            {drinkCategories.map((category, z) => (
              <button
                type="button"
                className={`btn btn-primary btn-primary-hover-none btn-primary-focus-none btn-primary-active-none text-height-lg ${
                  filter.category.includes(category) &&
                  "font-weight-bold text-lg"
                }`}
                onClick={() => setFilter({ search: "", category: [category] })}
                key={z}
              >
                {category}
              </button>
            ))}
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
                    {filteredDrinks.length} Drinks Showing
                    {Object.keys(filter).some((i) => filter[i].length) && (
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setFilter({ search: "", category: [] })}
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                  <td colSpan="3">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search Drinks"
                      value={filter.search}
                      onChange={(e) => {
                        const search = e.target.value;
                        setFilter({ search, category: [] });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Category</td>
                  <td className="text-muted">Name</td>
                  <td className="text-muted">Size</td>
                  <td className="text-muted">Is Popular</td>
                  <td className="text-muted">Price</td>
                </tr>
              </thead>
              <tbody>
                {filteredDrinks.map((drink) => (
                  <tr
                    className="shadow rounded-pill"
                    key={drink._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setModifyDrink(drink)}
                  >
                    <td
                      className="p-4 text-center right-divider"
                      style={{ width: "100px" }}
                    >
                      <img
                        src={
                          drink.category in categoryIcons
                            ? categoryIcons[drink.category]
                            : categoryIcons["default"]
                        }
                        alt="Drink Icon"
                        style={{ height: "36px", width: "auto" }}
                      />
                    </td>
                    <td style={{ width: "250px" }}>{drink.name}</td>
                    <td style={{ width: "200px" }}>
                      {drink.sizes?.length ? drink.sizes[0].size : 0}
                    </td>
                    <td>{drink.ispopular}</td>
                    <td>
                      £
                      {drink.sizes?.length
                        ? parseFloat(drink.sizes[0].price).toFixed(2)
                        : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddOrUpdateDrinkModal
        show={addDrink || !!modifyDrink}
        drink={modifyDrink}
        onSuccess={({ type, drink }) => {
          switch (type) {
            case "add":
              setDrinks((prevDrinks) => [drink, ...prevDrinks]);
              break;
            case "update":
              setDrinks((prevDrinks) =>
                prevDrinks.map((d) => {
                  if (d._id === modifyDrink._id) return drink;
                  return d;
                })
              );
              break;
            case "delete":
              setDrinks((prevDrinks) =>
                prevDrinks.filter((d) => d._id !== modifyDrink._id)
              );
              break;
            default:
              break;
          }

          setAddDrink(false);
          setModifyDrink(null);
        }}
        onHide={() => {
          setAddDrink(false);
          setModifyDrink(null);
        }}
      />
    </>
  );
}

/**
 * Add a drink if props.drink exists else Update.
 */
function AddOrUpdateDrinkModal({ drink, show, onHide, onSuccess }) {
  const [category, setCategory] = useState(drink?.category || "");
  const [name, setName] = useState(drink?.name || "");
  const [sizes, setSizes] = useState(drink?.sizes || []);
  const [image, setImage] = useState(drink?.image || "");
  const [ispopular, setIspopular] = useState(drink?.ispopular || "yes");
  const [instock, setInstock] = useState(drink?.instock || "yes");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const match = useRouteMatch("/dashboard/menus/:menu_id/drinks");
  const menu_id = match.params.menu_id;

  useEffect(() => {
    axios
      .get(`${REACT_APP_API_ENDPOINT}/drink/categories`)
      .then((response) => {
        setAvailableCategories(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, []);

  // App State
  const {
    appState: {
      user: { access_token },
    },
  } = useContext(AppStore);

  // Update state on Props changes
  useEffect(() => {
    setCategory(drink?.category || "");
    setName(drink?.name || "");
    setImage(drink?.image || null);
    setIspopular(drink?.ispopular || "yes");
    setInstock(drink?.instock || "yes");
  }, [drink]);

  // Submit Drink
  const submitDrink = (type) => {
    setIsFetching(true);

    let request;

    switch (type) {
      case "add":
        // Add Request
        request = axios.post(
          `${REACT_APP_API_ENDPOINT}/venue/drink/${menu_id}`,
          { category, name, image, ispopular, sizes, instock },
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      case "update":
        // Patch Request
        request = axios.patch(
          `${REACT_APP_API_ENDPOINT}/venue/drink/${drink._id}`,
          { category, name, image, ispopular, sizes, instock },
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      case "delete":
        // Delete Request
        request = axios.delete(
          `${REACT_APP_API_ENDPOINT}/venue/drink/${drink._id}`,
          {
            headers: { authorization: `Bearer ${access_token}` },
          }
        );
        break;
      default:
        break;
    }

    // Send Request
    request
      .then(
        (response) => {
          onSuccess({ type, drink: response.data });

          if (type === "add") toast.success("Added Drink!");
          if (type === "update") toast.success("Updated Drink!");
          if (type === "delete") toast.success("Deleted Drink!");
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
          {category && !drink && (
            <div className="btn mr-2" onClick={() => setCategory("")}>
              &#x3C;
            </div>
          )}
          {drink ? "Update Drink" : "Add Drink"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!category &&
          availableCategories.map((value, k) => (
            <React.Fragment key={k}>
              <div
                className="d-flex text-muted my-2"
                style={{ cursor: "pointer" }}
                onClick={() => setCategory(value)}
              >
                <div className="w-100">{value}</div>
                <div>&#x3E;</div>
              </div>
            </React.Fragment>
          ))}
        {category && (
          <form>
            <div className="row">
              <div className="col-6">
                <select
                  className="form-control my-4"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Category</option>
                  {availableCategories.map((value, i) => (
                    <option value={value} key={i}>
                      {value}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-control my-4"
                  placeholder="Drink Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {["Soft Drinks", "Cocktails"].includes(category) && (
                <div className="col-6 d-flex flex-column justify-content-center align-items-center">
                  <label>Drink Image</label>
                  <UploadFile
                    initialUrl={image}
                    onUpload={(url) => setImage(url)}
                  />
                </div>
              )}
            </div>

            <SizeSelector
              initialSizes={drink?.sizes || []}
              onChange={(sizes) => setSizes(sizes)}
            />
            <div className="my-4">
              <label className="form-label font-weight-bold">Is popular</label>
              <select
                className="form-control"
                value={ispopular}
                onChange={(e) => setIspopular(e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="my-4">
              <label className="form-label font-weight-bold">In Stock</label>
              <select
                className="form-control"
                value={instock}
                onChange={(e) => setInstock(e.target.value)}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </form>
        )}
      </Modal.Body>

      <Modal.Footer>
        {drink ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => submitDrink("delete")}
              disabled={isFetching}
            >
              Delete Drink
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => submitDrink("update")}
              disabled={isFetching}
            >
              Update Drink
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => submitDrink("add")}
            disabled={isFetching}
          >
            Save Drink
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

AddOrUpdateDrinkModal.defaultProps = {
  drink: {
    _id: 1,
    category: "Shots",
    name: "Default Name",
    ispopular: false,
    instock: false,
    sizes: [],
  },
  show: false,
  onSuccess: (i) => i,
  onHide: (i) => i,
};

AddOrUpdateDrinkModal.propTypes = {
  drink: PropTypes.shape({
    _id: PropTypes.string,
    category: PropTypes.string,
    name: PropTypes.string,
    ispopular: PropTypes.string,
    instock: PropTypes.string,
    sizes: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      })
    ),
  }),
  show: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func,
  onHide: PropTypes.func,
};

function SizeSelector({ initialSizes, onChange }) {
  const [sizes, setSizes] = useState(initialSizes);

  // emit onChange
  useEffect(() => {
    onChange(sizes);
  }, [sizes, onChange]);

  return (
    <div className="my-5">
      <label className="form-label font-weight-bold">Sizes</label>
      {[...sizes, { size: "", price: "" }].map(({ size, price }, i) => (
        <div className="row" key={i}>
          <div className="col-5">
            <input
              type="text"
              className="form-control mr-2"
              value={size || ""}
              placeholder="Size"
              onChange={(e) => {
                const value = e.target.value;

                setSizes((s) => {
                  const newSizes = [...s];
                  newSizes[i] = { ...newSizes[i], size: value };
                  return newSizes;
                });
              }}
            />
          </div>
          <div className="col-4">
            <input
              type="text"
              className="form-control mx-2"
              placeholder="Price"
              value={price || ""}
              onChange={(e) => {
                const value = e.target.value;

                setSizes((s) => {
                  const newSizes = [...s];
                  newSizes[i] = { ...newSizes[i], price: value };
                  return newSizes;
                });
              }}
              disabled={!size}
            />
          </div>
          <div className="col-3">
            {(size || price) && (
              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() =>
                  setSizes((s) => {
                    const newSizes = [...s];
                    newSizes.splice(i, 1);
                    return newSizes;
                  })
                }
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

SizeSelector.defaultProps = {
  sizes: [],
  onChange: (i) => i,
};

SizeSelector.propTypes = {
  sizes: PropTypes.arrayOf(
    PropTypes.shape({
      size: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  onChange: PropTypes.func,
};
