const express=require('express')
const mongoose=require('mongoose')
const bodyParser=require('body-parser') //Es para parsear los body que recibimos en las peticiones HTTP
const {config}=require('dotenv')
config();

//Importo las rutas
const bookRoutes = require('./routes/book.routes')

const app=express();
app.use(bodyParser.json()); //Es para parsear los body que recibimos en las peticiones HTTP

//Acá vamos a conectar la base de datos
mongoose.connect(process.env.MONGO_URL,{dbName:process.env.MONGO_DB_NAME})
const db=mongoose.connection;

//Aquí le decimos a la app que use las rutas
app.use('/books',bookRoutes);



const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Servidor iniciado en el puerto ${port}`)
})