const express = require("express");
const db = require("./database");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const open = require("open");
const os = require("os");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

app.post("/add-food", upload.single("image"), (req, res) => {
    const { name, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(`INSERT INTO foods (name, price, image) VALUES (?, ?, ?)`, [name, price, image], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, price, image });
    });
});

app.get("/foods", (req, res) => {
    db.all(`SELECT * FROM foods`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.delete("/delete-food/:id", (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM foods WHERE id = ?`, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Food item deleted" });
    });
});

app.get("/random-dishes", (req, res) => {
    db.all(`SELECT * FROM foods ORDER BY RANDOM() LIMIT 3`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get("/foods", (req, res) => {
    db.all(`SELECT * FROM foods`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get("/search-food", (req, res) => {
    const searchQuery = req.query.q;
    db.all(`SELECT * FROM foods WHERE name LIKE ?`, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post("/add-to-cart", (req, res) => {
    const { user_id, food_id, quantity } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: "User not logged in" });
    }

    db.get(`SELECT * FROM cart WHERE user_id = ? AND food_id = ?`, [user_id, food_id], (err, row) => {
        if (row) {
            db.run(`UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND food_id = ?`, 
                [quantity, user_id, food_id], 
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Cart updated successfully!" });
                }
            );
        } else {
            db.run(`INSERT INTO cart (user_id, food_id, quantity) VALUES (?, ?, ?)`, 
                [user_id, food_id, quantity], 
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: this.lastID, message: "Item added to cart!" });
                }
            );
        }
    });
});

app.get("/cart/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.all(
        `SELECT cart.id, cart.quantity, foods.name, foods.price, foods.image 
         FROM cart 
         JOIN foods ON cart.food_id = foods.id 
         WHERE cart.user_id = ?`, 
        [user_id], 
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

app.delete("/cart/:user_id/:cart_id", (req, res) => {
    const { user_id, cart_id } = req.params;
    db.run(`DELETE FROM cart WHERE user_id = ? AND id = ?`, [user_id, cart_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item removed from cart" });
    });
});

app.delete("/cart/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cart cleared" });
    });
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, 
        [username, email, hashedPassword], 
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "User registered successfully" });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "User not found" });

        // Compare hashed password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

        res.json({ id: user.id, username: user.username, message: "Login successful" });
    });
});

app.post("/update-cart", (req, res) => {
    const { user_id, cart_id, change } = req.body;

    db.get(`SELECT quantity FROM cart WHERE user_id = ? AND id = ?`, [user_id, cart_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Item not found in cart" });

        const newQuantity = row.quantity + change;
        
        if (newQuantity <= 0) {
            db.run(`DELETE FROM cart WHERE user_id = ? AND id = ?`, [user_id, cart_id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Item removed from cart" });
            });
        } else {
            db.run(`UPDATE cart SET quantity = ? WHERE user_id = ? AND id = ?`, 
                [newQuantity, user_id, cart_id], 
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Cart updated successfully!" });
                }
            );
        }
    });
});

app.post("/place-order", (req, res) => {
    const { user_id, name, email, phone, address, paymentMethod, totalAmount } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: "User not logged in" });
    }

    db.run(
        `INSERT INTO orders (user_id, name, email, phone, address, payment_method, total_amount, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [user_id, name, email, phone, address, paymentMethod, totalAmount],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Clear the cart after order placement
            db.run(`DELETE FROM cart WHERE user_id = ?`, [user_id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, orderId: this.lastID });
            });
        }
    );
});

app.get("/latest-order/:user_id", (req, res) => {
    const { user_id } = req.params;

    db.get(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`, 
        [user_id], 
        (err, order) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!order) return res.status(404).json({ error: "No recent orders found." });

            db.all(
                `SELECT foods.name, foods.price, cart.quantity 
                 FROM cart 
                 JOIN foods ON cart.food_id = foods.id 
                 WHERE cart.user_id = ?`,
                [user_id],
                (err, items) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ order, items });
                }
            );
        }
    );
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,  "public",));
});


const PORT = 3000;
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => {
    const interfaces = os.networkInterfaces();
    let localIP = "localhost";

    for (let key in interfaces) {
        for (let iface of interfaces[key]) {
            if (iface.family === "IPv4" && !iface.internal) {
                localIP = iface.address; // Get the local network IP
            }
        }
    }
    

    console.log(`Server is running on:`);
    console.log(`➡  Local:   http://localhost:${PORT}`);
    console.log(`➡  LAN:     http://${localIP}:${PORT}`);

    //open(`http://localhost:${PORT}/login.html`); // Open on the local machine
});
