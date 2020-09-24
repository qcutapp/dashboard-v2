import React, { useState, useContext, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import axios from "axios";
import UploadFile from "components/UploadFile";

import { AppStore } from "store";

export default function Drinks() {
  const [drinks, setDrinks] = useState([]);
  const [venueCategories, setVenueCategories] = useState([]);
  const [addDrink, setAddDrink] = useState(false);
  const [modifyDrink, setModifyDrink] = useState(null);
  const [filter, setFilter] = useState({
    category: [],
    search: "",
  });

  // App state
  const {
    appState: { venue, user },
    appDispatch,
  } = useContext(AppStore);

  useEffect(() => {
    // Get drinks
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/venue/drink`, {
        headers: { authorization: `Bearer ${user.access_token}` },
      })
      .then((response) => {
        setDrinks(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });

    // Get categories
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/venue/categories`, {
        headers: { authorization: `Bearer ${user.access_token}` },
      })
      .then((response) => {
        setVenueCategories(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, [venue, user]);

  // Filter drinks
  let filteredDrinks = drinks
    .filter((drink) => !drink.deleted)
    .filter((drink) => {
      if (!filter.category.length && !filter.search) return true;

      if (filter.category.length && filter.category.includes(drink.category)) {
        return true;
      }

      if (
        filter.search &&
        drink.name.toLowerCase().includes(filter.search.toLowerCase())
      ) {
        return true;
      }

      return false;
    });

  // Sort drinks
  filteredDrinks.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));

  // Category icons
  const categoryIcons = {
    Shots: process.env.PUBLIC_URL + "/drinks/Grey-Shots-Icon.svg",
    Spirits: process.env.PUBLIC_URL + "/drinks/Grey-Spirit-Icon.svg",
    Cocktails: process.env.PUBLIC_URL + "/drinks/Grey-Cocktail-Icon.svg",
    Wines: process.env.PUBLIC_URL + "/drinks/Grey-Wine-Icon.svg",
    Beers: process.env.PUBLIC_URL + "/drinks/Grey-beer-Icon.svg",
    Ciders: process.env.PUBLIC_URL + "/drinks/Grey-Cider-Icon.svg",
    "Soft Drinks": process.env.PUBLIC_URL + "/drinks/Grey-SoftDrink-Icon.svg",
    "Hot Drinks": process.env.PUBLIC_URL + "/drinks/Grey-Hot-Icon.svg",
    Sparkling: process.env.PUBLIC_URL + "/drinks/Grey-Sparkling-Icon.svg",
    Bottles: process.env.PUBLIC_URL + "/drinks/Grey-Bottles-Icon.svg",
    Alcopops: process.env.PUBLIC_URL + "/drinks/Grey-Alcopops-Icon.svg",
    Liquers: process.env.PUBLIC_URL + "/drinks/Grey-Liquors-Icon.svg",
    default: process.env.PUBLIC_URL + "/drinks/Grey-Shots-Icon.svg",
  };

  return (
    <div className="container container-drinks">
      <div className="row mt-3 mb-5">
        <div className="col-sm">
          <h1 className="text-light text-weight-bold">Your Drinks</h1>
        </div>
        <div className="col-sm text-right">
          <div
            className="btn btn-primary btn-primary-hover-none btn-lg"
            onClick={() => setAddDrink(true)}
          >
            Add Drink
            <img
              src={process.env.PUBLIC_URL + "/add-icon.png"}
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
            {venueCategories.map((category, z) => (
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
                    {filteredDrinks.length} Items Showing
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
                      className="p-4 right-divider"
                      style={{ width: "125px" }}
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
              appDispatch({
                type: "VENUE:ADD_OR_UPDATE",
                payload: { drink },
              });
              break;
            case "update":
              setDrinks((prevDrinks) =>
                prevDrinks.map((d) => {
                  if (d._id === modifyDrink._id) return drink;
                  return d;
                })
              );
              appDispatch({
                type: "VENUE:ADD_OR_UPDATE",
                payload: { drink },
              });
              break;
            case "delete":
              setDrinks((prevDrinks) =>
                prevDrinks.filter((d) => d._id !== modifyDrink._id)
              );
              appDispatch({
                type: "VENUE:DELETE",
                payload: { drink: modifyDrink },
              });
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
    </div>
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

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/drink/categories`)
      .then((response) => {
        setAvailableCategories(response.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message);
      });
  }, []);

  // App State
  const { appState } = useContext(AppStore);

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
    let request;

    switch (type) {
      case "add":
        // Add Request
        request = axios.post(
          `${process.env.REACT_APP_API_ENDPOINT}/venue/drink`,
          { category, name, image, ispopular, sizes, instock },
          {
            headers: { authorization: `Bearer ${appState.user.access_token}` },
          }
        );
        break;
      case "update":
        // Patch Request
        request = axios.patch(
          `${process.env.REACT_APP_API_ENDPOINT}/venue/drink/${drink._id}`,
          { category, name, image, ispopular, sizes, instock },
          {
            headers: { authorization: `Bearer ${appState.user.access_token}` },
          }
        );
        break;
      case "delete":
        // Delete Request
        request = axios.delete(
          `${process.env.REACT_APP_API_ENDPOINT}/venue/drink/${drink._id}`,
          {
            headers: { authorization: `Bearer ${appState.user.access_token}` },
          }
        );
        break;
      default:
        break;
    }

    // Send Request
    request.then(
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
    );
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
          availableCategories.map((value) => (
            <>
              <div
                className="d-flex text-muted my-2"
                style={{ cursor: "pointer" }}
                onClick={() => setCategory(value)}
              >
                <div className="w-100">{value}</div>
                <div>&#x3E;</div>
              </div>
            </>
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
              category={category}
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
        {drink && (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => submitDrink("delete")}
            >
              Delete Drink
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => submitDrink("update")}
            >
              Update Drink
            </button>
          </>
        )}
        {!drink && (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => submitDrink("add")}
          >
            Save Drink
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

AddOrUpdateDrinkModal.defaultProps = {
  drink: PropTypes.shape({
    _id: 1,
    category: "Shots",
    name: "Default Name",
    ispopular: false,
    instock: false,
    sizes: [],
  }),
  show: false,
  onSuccess: (i) => i,
  onHide: (i) => i,
};

AddOrUpdateDrinkModal.propTypes = {
  drink: PropTypes.shape({
    _id: PropTypes.string,
    search: "",
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

function SizeSelector({ initialSizes, onChange, category }) {
  const [sizes, setSizes] = useState(initialSizes);

  // Size Options
  const sizeOptions = {
    Spirits: ["Single", "Double", "Triple", "Bottle"],
    Cocktails: ["Standard", "Large", "Pitcher", "Jug"],
    Wines: [
      "Bottle",
      "125ml Glass",
      "175ml Glass",
      "250ml Glass",
      "500ml Bottle",
      "750ml Bottle",
      "1L Bottle",
    ],
    "Soft Drinks": ["Can", "Standard", "Large", "Bottle"],
    "Beers & Bottles": [
      "Pint",
      "Half-Pint",
      "330ml Bottle",
      "500ml Bottle",
      "275ml Bottle",
      "470ml Bottle",
      "550ml Bottle",
      "640ml Bottle",
      "355ml Bottle",
    ],
    Shots: ["Single", "Double", "Triple", "Bomb"],
  };

  // emit onChange
  useEffect(() => {
    onChange(sizes);
  }, [sizes, onChange]);

  console.log("sizes:", sizes);

  return (
    <div className="my-5">
      <label className="form-label font-weight-bold">Sizes</label>
      {Array(sizes.filter((s) => s.size && s.price).length + 1)
        .fill()
        .map((_, i) => (
          <div className="row" key={i}>
            <div className="col-5">
              <select
                className="form-control mr-2"
                value={sizes[i]?.size || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSizes((s) => {
                    const newS = [...s];
                    newS[i] = { ...newS[i], size: value };
                    return newS;
                  });
                }}
                disabled={!category}
              >
                <option value="">Size</option>
                {category in sizeOptions &&
                  sizeOptions[category].map((s) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-4">
              <input
                type="text"
                className="form-control mx-2"
                placeholder="Price"
                value={sizes[i]?.price || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSizes((s) => {
                    const newS = [...s];
                    newS[i] = { ...newS[i], price: value };
                    return newS;
                  });
                }}
                disabled={!sizes[i]?.size}
              ></input>
            </div>
            <div className="col-3">
              <button
                type="button"
                className="btn btn-link btn-sm"
                style={{
                  visibility:
                    sizes[i]?.size && sizes[i]?.price ? "visible" : "hidden",
                }}
                onClick={() => {
                  setSizes((s) => {
                    const newS = [...s];
                    newS.splice(i, 1);
                    return newS;
                  });
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

SizeSelector.defaultProps = {
  sizes: [],
  category: "",
  onChange: (i) => i,
};

SizeSelector.propTypes = {
  sizes: PropTypes.arrayOf(
    PropTypes.shape({
      size: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  category: PropTypes.string,
  onChange: PropTypes.func,
};
