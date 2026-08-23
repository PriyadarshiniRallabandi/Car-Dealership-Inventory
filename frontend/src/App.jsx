import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
const [fuelFilter, setFuelFilter] = useState("All");
const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    fuel_type: "",
    availability: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchCars = async () => {
    try {
      const response = await fetch(`${API_URL}/cars`);
      const data = await response.json();
      setCars(data);
    } catch (error) {
      setMessage("Unable to connect to backend");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);
  const filteredCars = cars.filter((car) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    car.brand.toLowerCase().includes(searchText) ||
    car.model.toLowerCase().includes(searchText);

  const matchesFuel =
    fuelFilter === "All" ||
    car.fuel_type.toLowerCase() === fuelFilter.toLowerCase();

  const matchesAvailability =
    availabilityFilter === "All" ||
    (availabilityFilter === "Available" && car.availability) ||
    (availabilityFilter === "Sold" && !car.availability);

  return (
    matchesSearch &&
    matchesFuel &&
    matchesAvailability
  );
});
const totalCars = cars.length;
const availableCars = cars.filter(
  (car) => car.availability
).length;

const soldCars = cars.filter(
  (car) => !car.availability
).length;

const inventoryValue = cars.reduce(
  (total, car) => total + Number(car.price),
  0
);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();

if (Number(form.year) < 1900 || Number(form.year) > currentYear) {
  setMessage(`Year must be between 1900 and ${currentYear}`);
  return;
}

if (Number(form.price) <= 0) {
  setMessage("Price must be greater than 0");
  return;
}

if (Number(form.mileage) < 0) {
  setMessage("Mileage cannot be negative");
  return;
}

    const carData = {
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      fuel_type: form.fuel_type,
      availability: form.availability,
    };

    try {
      const url = editingId
        ? `${API_URL}/cars/${editingId}`
        : `${API_URL}/cars`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setMessage(
        editingId
          ? "Vehicle updated successfully"
          : "Vehicle added successfully"
      );
      setTimeout(() => {
      setMessage("");
      }, 3000);

      resetForm();
      fetchCars();
    } catch (error) {
      setMessage("Operation failed");
    }
  };

  const handleEdit = (car) => {
    setEditingId(car.id);

    setForm({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      fuel_type: car.fuel_type,
      availability: car.availability,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cars/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Vehicle deleted successfully");
      fetchCars();
    } catch (error) {
      setMessage("Delete failed");
    }
  };
  const handleMarkSold = async (car) => {
  try {
    const response = await fetch(`${API_URL}/cars/${car.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        fuel_type: car.fuel_type,
        availability: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark vehicle as sold");
    }

    setMessage("Vehicle marked as sold");
    fetchCars();
  } catch (error) {
    setMessage("Failed to mark vehicle as sold");
  }
};

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      fuel_type: "",
      availability: true,
    });

    setEditingId(null);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Car Dealership Inventory</h1>
          <p style={styles.subtitle}>
            Manage dealership vehicles easily
          </p>
        </div>
      </header>

      <main style={styles.container}>
        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
        <div style={styles.dashboard}>

  <div style={styles.statCard}>
    <h3>Total Cars</h3>
    <p>{totalCars}</p>
  </div>

  <div style={styles.statCard}>
    <h3>Available Cars</h3>
    <p>{availableCars}</p>
  </div>

  <div style={styles.statCard}>
    <h3>Sold Cars</h3>
    <p>{soldCars}</p>
  </div>

  <div style={styles.statCard}>
    <h3>Inventory Value</h3>
    <p>${inventoryValue.toLocaleString()}</p>
  </div>

</div>

        <section style={styles.card}>
          <h2>
            {editingId ? "Edit Vehicle" : "Add Vehicle"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <input
                name="brand"
                placeholder="Brand"
                value={form.brand}
                onChange={handleChange}
                required
              />

              <input
                name="model"
                placeholder="Model"
                value={form.model}
                onChange={handleChange}
                required
              />

              <input
                name="year"
                type="number"
                placeholder="Year"
                value={form.year}
                onChange={handleChange}
                required
              />

              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                required
              />

              <input
                name="mileage"
                type="number"
                placeholder="Mileage"
                value={form.mileage}
                onChange={handleChange}
                required
              />

              <input
                name="fuel_type"
                placeholder="Fuel Type"
                value={form.fuel_type}
                onChange={handleChange}
                required
              />
            </div>

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                name="availability"
                checked={form.availability}
                onChange={handleChange}
              />
              Available
            </label>

            <div>
              <button type="submit" style={styles.addButton}>
              {editingId ? "Update Vehicle" : "Add Vehicle"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.listHeader}>
            <h2>Vehicle Inventory</h2>
            <span>{filteredCars.length} vehicle(s)</span>
          </div>
          <div style={styles.filters}>
  <input
    type="text"
    placeholder="Search by brand or model..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <select
    value={fuelFilter}
    onChange={(e) => setFuelFilter(e.target.value)}
  >
    <option value="All">All Fuel Types</option>
    <option value="Petrol">Petrol</option>
    <option value="Diesel">Diesel</option>
    <option value="Electric">Electric</option>
    <option value="Hybrid">Hybrid</option>
  </select>

  <select
    value={availabilityFilter}
    onChange={(e) => setAvailabilityFilter(e.target.value)}
  >
    <option value="All">All Status</option>
    <option value="Available">Available</option>
    <option value="Sold">Sold</option>
  </select>
</div>

          {filteredCars.length === 0 ? (
            <p style={styles.empty}>
              No vehicles available in inventory.
            </p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Price</th>
                    <th>Mileage</th>
                    <th>Fuel</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCars.map((car) => (
                    <tr key={car.id}>
                      <td>{car.id}</td>
                      <td>{car.brand}</td>
                      <td>{car.model}</td>
                      <td>{car.year}</td>
                      <td>${car.price}</td>
                      <td>{car.mileage}</td>
                      <td>{car.fuel_type}</td>
                      <td>
                        {car.availability
                          ? "Available"
                          : "Sold"}
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(car)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>
                         {car.availability && (
                        <button
                        onClick={() => handleMarkSold(car)}
                        style={styles.soldButton}
                        >
                        Mark as Sold
                       </button>
                       )}

                        <button
                          onClick={() => handleDelete(car.id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  filters: {
    display: "flex",
    gap: "12px",
    margin: "20px 0",
    flexWrap: "wrap",
  },

  dashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    background: "#1f3c88",
    color: "white",
    padding: "25px 50px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    margin: "8px 0 0",
    opacity: 0.9,
  },

  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "0 20px",
  },

  card: {
    background: "white",
    padding: "25px",
    marginBottom: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
    marginBottom: "15px",
  },

  message: {
  background: "#d4edda",
  color: "#155724",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
  fontWeight: "bold",
  },
  checkbox: {
    display: "block",
    marginBottom: "20px",
  },

  primaryButton: {
    background: "#1f3c88",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px",
  },

  secondaryButton: {
    padding: "12px 20px",
    border: "1px solid #aaa",
    background: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },

  editButton: {
    background: "#f0ad4e",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "5px",
  },

  deleteButton: {
    background: "#d9534f",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#777",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
};

export default App;