const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = 3000;

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

app.use(
    OpenApiValidator.middleware({
        apiSpec: swaggerDocument,
        validateRequests: true,
        validateResponses: true,
        ignorePaths: /.*\/docs.*/, // Ignore the docs path
    })  
);

app.use((err,req,res,next) =>{
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors
    });
});

app.get('/v1/hello', (req, res) =>{
    res.json({message: 'Hello World'});
});
app.get('/v2/hello', (req, res) =>{
    res.json({message: 'Hello World', 
        version: 'v2',
        timestamp: new Date().toISOString()
    });
});


app.post('/users', (req, res) => {
    const {name, age, email} = req.body;
    const newUser = {
        id: Date.now().toString(),
        name,
        age,
        email
    }
    res.status(201).json(newUser);
});

// Base de datos en un Array

const users = [{
    id: 1,
    name: 'Sebastian Garcia',
    age: 26,
    email: 'sebastian@santamarias.com'
},{
    id: 2,
    name: 'Angie Gaona',
    age: 30,
    email: 'angie@santamarias.com'
},{
    id: 3,
    name: 'Dayanne Garcia',
    age: 29,
    email: 'dayanne@santamarias.com'
}];


app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if(!user){
        return res.status(404).json({ message: 'Usuario no encontrado'});
    }
    res.json({
        id: user.id,
        name: user.name
    });
});

app.post('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, age, email } = req.body;

    const userIndex = users.findIndex(u => u.id === userId);
    if(userIndex === -1) {
        return res.status(404).json({message: 'Usuario no encontrado'});
    }
    const updatedUser = {
        id: userId,
        name,
        age,
        email
    };
    users[userIndex] = updatedUser;
    
    res.json(updatedUser);
});

// Base de datos simulada para los productos

const products = [{
    id: '1',
    name: 'Minicake',
    description: 'Cake from 5 to 7 slides',
    price: 70000.00,
    category: 'cakes',
    tags: ['minicake','cake'],
    inStock: true,
    specifications: {
        'Slides': '5 to 7',
        'Flavors': 'Any'
    },
    ratings: [{
        score: 5,
        comment: 'Torta ideal para 5 personas'
    }]
},{
    id: '2',
    name: 'Cupcakes',
    description: 'Combo of 6 cupcakes',
    price: 60000.00,
    category: 'desserts',
    tags: ['desserts','cupcake'],
    inStock: true,
    specifications: {
        'quantity': '6 or more',
        'Flavors': 'Any'
    },
    ratings: [{
        score: 5,
        comment: 'Grandes y deliciosos'
    }]
}];

// Endpoints para productos

app.get('/products', (req, res) =>{
    res.json(products);
});

app.post('/products', (req, res) =>{
    const newProduct = {
        id: Date.now().toString(),
        ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/products/:id', (req, res) =>{
    const product = products.find(p => p.id === req.params.id);
    if(!product){
        return res.status(404).json({message: 'Producto no encontrado'});
    }
    res.json(product)
});

app.put('/products/:id', (req, res) =>{
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if(productIndex === -1){
        return res.status(404).json({message: 'Producto no encontrado'});
    }
    const updatedProduct = {
        id: req.params.id,
        ...req.body
    };
    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
});

app.delete('/products/:id', (req, res) =>{
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if(productIndex === -1){
        return res.status(404).json({message: 'Producto no encontrado'});
    }
    products.splice(productIndex,1);
    res.status(204).send();
});

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}/v1`);
    console.log(`http://localhost:${port}/v2`);
});