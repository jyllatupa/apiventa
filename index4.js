const express = require('express');
const jwt = require("jsonwebtoken");
const app = express();
const sqlite3 = require('sqlite3');
var cors = require('cors');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

// Connecting Database
let db = new sqlite3.Database(":memory:" , (err) => {
	if(err) {
		console.log("Error Occurred - " + err.message);
	}
	else {
		console.log("DataBase Connected");
	}
})

app.get('/', (req, res) => {
    res.send('API Ventas');
})

app.post("/api/login", (req, res) => {
    const user = {
        id: 1,
        nombre: "JonathanY",
        email: "jyllatupal@gmail.com"
    }

    jwt.sign({user}, 'secretkey', (err, token) => {
        res.json({
            token
        })
    })
});

function verifyToken(req, res, next){
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader != 'undefined'){
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403);
    }
}

//LISTAR
var selectQuery = 'SELECT * FROM Ventas ;'
app.get('/api/ventas', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if(error){
            res.sendStatus(403);
        }else{
            db.all(selectQuery , (err , data) => {
                if(err){
                    res.status(404).send('No se encontraron registros');
                }else{
                    res.send(data);
                };
            });
        }
    })
});

//BUSCADOR
var selectQueryByNro = 'SELECT * FROM Ventas WHERE nrodocumento = ';
app.get('/api/ventas/:nrodocumento', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if(error){
            res.sendStatus(403);
        }else{
            var newquery = selectQueryByNro + "'" + req.params.nrodocumento + "'";
            db.all(newquery , (err , data) => {
                if(err){
                    res.status(404).send('No se encontraron registros');
                }else{
                    res.send(data);
                };
            });
        }
    })
})

//UPDATE
var updateQuery =
'UPDATE Ventas SET ';
app.put('/api/ventas', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if(error){
            res.sendStatus(403);
        }else{
            const paramsventas = {
                codventa: req.body.codventa,
                vendedor: req.body.vendedor,
                nrodocumento: req.body.nrodocumento,
                producto: req.body.producto,
                cantidad: parseInt(req.body.cantidad),
                precio: req.body.precio
            };
        
            let sqlUpdate = updateQuery + 'vendedor = "' + paramsventas.vendedor +'", nrodocumento = "' + 
                            paramsventas.nrodocumento +'", producto = "' + paramsventas.producto +'", cantidad = ' +
                            parseInt(paramsventas.cantidad) + ', precio = "' + parseFloat(paramsventas.precio) +'" WHERE codventa = ' +
                            parseInt(paramsventas.codventa);
            // res.json(sqlUpdate);
            db.run(sqlUpdate , (err) => {
                if(err) return;
        
                res.json('ok');
            });
        }
    })
})

//ELIMINAR
var deleteQuery =
'DELETE FROM Ventas ';
app.delete('/api/ventas', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if(error){
            res.sendStatus(403);
        }else{
            const paramsventas = {
                codventa: req.body.codventa
            };
        
            let sqldelete = deleteQuery + 'WHERE codventa = ' + parseInt(paramsventas.codventa);
            // res.json(sqlUpdate);
            db.run(sqldelete , (err) => {
                if(err) return;
        
                res.json('ok');
            });
        }
    })
})


//INSERTAR
var insertQuery =
'INSERT INTO Ventas(vendedor, nrodocumento, producto, cantidad, precio) VALUES ("';
app.post('/api/ventas', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if(error){
            res.sendStatus(403);
        }else{
            const paramsventas = {
                vendedor: req.body.vendedor,
                nrodocumento: req.body.nrodocumento,
                producto: req.body.producto,
                cantidad: parseInt(req.body.cantidad),
                precio: parseFloat(req.body.precio)
            };
        
            let sqlInsert = insertQuery +  paramsventas.vendedor + '", "' + paramsventas.nrodocumento + '", "' + paramsventas.producto + '", ' + paramsventas.cantidad + ', ' + parseFloat(paramsventas.precio) +')';
            // res.json(sqlInsert)
        
            db.run(sqlInsert , (err) => {
                if(err) return;
        
                res.json('ok');
            });
        }
    })
})


// Server Running
app.listen(4000 , () => {
	console.log("Server started");

	// Query
	var createQuery =
    'CREATE TABLE Ventas(codventa INTEGER PRIMARY KEY AUTOINCREMENT, vendedor text, nrodocumento text, producto text, cantidad integer, precio decimal(10,2));';
	var insertQuery =
'INSERT INTO Ventas(vendedor, nrodocumento, producto, cantidad, precio) VALUES("Juan Perez", "71212859", "TV", 2, 120.00);'
	var selectQuery = 'SELECT * FROM Ventas;'

	// Running Query
	db.run(createQuery , (err) => {
		if(err) return;

		// Success
		console.log("Table Created");
		db.run(insertQuery , (err) => {
			if(err) return;

			// Success
			console.log("Insertion Done");
			db.all(selectQuery , (err , data) => {
				if(err) return;

				// Success
				console.log(data);
			});
		});
	});
})

// db.close();

const port = process.env.port || 80;
app.listen(port, () => console.log(`Escuchando en puerto ${port}...`));