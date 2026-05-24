const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const app = express();

const SECRET_KEY = "shivshakti_secret";

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(express.json());
// ==========================
// IMAGE UPLOAD SETUP
// ==========================
const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        cb
    ) {

        cb(
            null,
            'uploads/'
        );
    },

    filename: function (
        req,
        file,
        cb
    ) {

        cb(
            null,
            Date.now()
            +
            path.extname(
                file.originalname
            )
        );
    }
});

const upload =
multer({
    storage
});

app.use(
    '/uploads',
    express.static(
        'uploads'
    )
);
// ==========================
// DATABASE CONNECTION
// ==========================
mongoose.connect(
'mongodb+srv://admin:Arshik%40%401@cluster0.ucbudkv.mongodb.net/shivshakti?retryWrites=true&w=majority'
)
.then(async () => {
    console.log("MongoDB Connected ✅");
    await createAdmin();
})
.catch(err => console.log(err));

// ==========================
// SCHEMAS
// ==========================
const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const productSchema =
new mongoose.Schema({

    name:
    String,

    price:
    Number,

    image:
    String,

    category:
    String,

    createdAt: {
        type:
        Date,

        default:
        Date.now
    }
});

const orderSchema = new mongoose.Schema({

    customerName: String,

    phone: String,

    address: String,

    city: String,

    pincode: String,

    paymentMethod: String,

    items: Array,

    total: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }
});
// ==========================
// MODELS
// ==========================
const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// ==========================
// CREATE ADMIN
// ==========================
async function createAdmin() {

    const existing =
        await Admin.findOne({
            username: "admin"
        });

    if (!existing) {

        const hashedPassword =
            await bcrypt.hash(
                "1234",
                10
            );

        await Admin.create({
            username: "admin",
            password: hashedPassword
        });

        console.log(
            "Default admin created ✅"
        );
    }
}

// ==========================
// TOKEN VERIFY
// ==========================
function verifyToken(
    req,
    res,
    next
) {

    const token =
        req.headers['authorization'];

    if (!token) {
        return res.status(403)
        .json({
            message:
            "No token ❌"
        });
    }

    try {

        jwt.verify(
            token,
            SECRET_KEY
        );

        next();

    } catch {

        return res.status(401)
        .json({
            message:
            "Invalid token ❌"
        });
    }
}

// ==========================
// LOGIN
// ==========================
app.post(
'/login',
async (req, res) => {

    const {
        username,
        password
    } = req.body;

    const admin =
        await Admin.findOne({
            username
        });

    if (!admin) {
        return res.status(401)
        .json({
            message:
            "Invalid username"
        });
    }

    const match =
        await bcrypt.compare(
            password,
            admin.password
        );

    if (!match) {
        return res.status(401)
        .json({
            message:
            "Wrong password"
        });
    }

    const token =
        jwt.sign(
            {
                id: admin._id
            },
            SECRET_KEY,
            {
                expiresIn:
                '1h'
            }
        );

    res.json({ token });
});

// ==========================
// PRODUCTS
// ==========================

// ADD PRODUCT
app.post(
    '/products',
    verifyToken,
    upload.single('image'),
    async (req, res) => {

        try {

            const product =
            new Product({

                name:
                req.body.name,

                price:
                req.body.price,

                category:
                req.body.category,

                image:
                req.file
                ?
                `http://localhost:5000/uploads/${req.file.filename}`
                :
                ""
            });

            await product.save();

            res.json(product);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                "Failed to add product"
            });
        }
    }
);

// GET PRODUCTS
app.get(
    '/products',
    async (req, res) => {

        const products =
        await Product.find();

        res.json(products);
    }
);

// UPDATE PRODUCT
app.put(
    '/products/:id',
    verifyToken,
    upload.single('image'),
    async (req, res) => {

        try {

            const oldProduct =
            await Product.findById(
                req.params.id
            );

            const updated =
            await Product.findByIdAndUpdate(
                req.params.id,
                {

                    name:
                    req.body.name,

                    price:
                    req.body.price,

                    category:
                    req.body.category,

                    image:
                    req.file
                    ?
                    `http://localhost:5000/uploads/${req.file.filename}`
                    :
                    oldProduct.image
                },
                {
                    new: true
                }
            );

            res.json(updated);

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                "Update failed"
            });
        }
    }
);

// DELETE PRODUCT
app.delete(
    '/products/:id',
    verifyToken,
    async (req, res) => {

        try {

            await Product.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message:
                "Deleted ✅"
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                message:
                "Delete failed ❌"
            });
        }
    }
);
// ==========================
// ORDERS
// ==========================
app.post(
'/orders',
async (req, res) => {

    const order =
        new Order(req.body);

    await order.save();

    res.json(order);
});

app.get(
'/orders',
async (req, res) => {

    const orders =
        await Order.find();

    res.json(orders);
});
// ==========================
// DELETE ALL ORDERS
// ==========================
app.delete(
'/orders',
async (req, res) => {

    try {

        await Order.deleteMany({});

        res.json({
            message:
            "All orders deleted ✅"
        });

    } catch (error) {

        res.status(500)
        .json({
            message:
            "Failed to delete orders ❌"
        });
    }
});
// ==========================
app.listen(5000, () => {
    console.log(
        "Server running on http://localhost:5000"
    );
});