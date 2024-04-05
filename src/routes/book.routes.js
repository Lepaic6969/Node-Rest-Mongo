const express=require('express');
const router=express.Router();
const Book=require('../models/book.models') //Este es el modelo que creamos en el archivo 'book.models.js'

//MIDDLEWARE: Este me retorna el registro correspondiente al id que le pase, lo usaremos en el GET y el UPDATE.
const getBook=async(req,res,next)=>{
    let book;
    const {id}=req.params; //Esto viene desde la URL
    //Quiero chequear que corresponde a un id válido

    if(!id.match(/^[0-9a-fA-F]{24}$/)){ //Expresión regular de un típico id de mongo
        //404 -> Bad Request
        return res.status(404).json(
            {
                message:'El ID del libro no es válido'
            }
        )
    }
    //Si el id está bien entonces tráigame el libro correspondiente
    try{
        book=await Book.findById(id);
        //Si no encontró el libro por más que el id sea un id válido...
        if(!book){
            //204 -> No Content
            return res.status(204).json(
                {
                    message:'El libro no fue encontrado'
                }
            )
        }
  

    }catch(error){
        //500 -> Error interno del servidor
        return res.status(500).json(
            {
                message:error.message
            }
        )
    }

    //Si se encontró el libro lo devuelvo en la respuesta de la petición
    res.book=book; //Configura el la respuesta el book
    next(); //Esto es para que siga después del middleware

}


//Obtener todos los libros [GET ALL]
router.get('/',async(req,res)=>{
    try{
        const books=await Book.find();
        console.log('GET ALL',books);
        if(books.length===0){
            //204 -> No Content
            return res.status(204).json([])
        }
        res.json(books)
    }catch(error){
        //500 -> Error interno del servidor
        res.status(500).json({message:error.message});
    }
})

//Crear un nuevo libro [POST]
router.post('/',async(req,res)=>{
    const {title,author,genre,publication_date}=req?.body;
    //Si alguno de los 3 atributos no viene...
    if(!title || !author || !genre || !publication_date){
        //400 -> Bad Request
        return res.status(400).json({
            message:'Los campos title,author,genre,publication_date; son obligatorios'
        })
    }

    //Si todo está bien genere el nuevo registro

    //Primero creo el libro
    const book=new Book(
        {
            title,
            author,
            genre,
            publication_date
        }
    )
    //Ahora llevo el libro creado a la base de datos
    try{
        const newBook=await book.save()
        console.log(newBook)
        //201 -> Created
        res.status(201).json(newBook) //Si fue exitoso devuelvo el nuevo libro creado
    }catch(error){
        //500 -> Error interno del servidor
        res.status(500).json({
            message:error.message
        })
    }
})


//Crear un libro [GET BY ID] -> Aquí utilizo en Middleware creado
router.get('/:id',getBook,async(req,res)=>{
    res.json(res.book);
})

//Actualizar un registro [PUT] ->Aquí utilizo el Middleware
router.put('/:id',getBook,async(req,res)=>{
    try{
        const book=res.book; //Esto quedaba definido en el Middleware

        //Ahora actualizo los campos
        book.title=req.body.title || book.title
        book.author=req.body.author || book.author
        book.genre=req.body.genre || book.genre
        book.publication_date=req.body.publication_date || book.publication_date

        //Una vez actualizado el libro, hacemos la actualización en la base de datos
        const updatedBook=await book.save();
        res.json(updatedBook); //Retorno el nuevo registro
    }catch(error){
        //400 -> Bad Request
        res.status(400).json({
            message:error.message
        })
    }
})

//Actualizar un registro [PATCH] -> Aquí uso el Middleware
//NOTA: En este caso funciona igual que el PUT, con la excepción de que al menos debo pasarle un parámetro
//para que se cambie en el registro.
router.patch('/:id',getBook,async(req,res)=>{
    
    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
        //400 -> Bad Request
        return res.status(400).json({
                message:'Al menos uno de estos campos debe ser enviado: title, author, genre, publication_date'
        })
    }
    try{
        const book=res.book; //Esto quedaba definido en el Middleware

        //Ahora actualizo los campos
        book.title=req.body.title || book.title
        book.author=req.body.author || book.author
        book.genre=req.body.genre || book.genre
        book.publication_date=req.body.publication_date || book.publication_date

        //Una vez actualizado el libro, hacemos la actualización en la base de datos
        const updatedBook=await book.save();
        res.json(updatedBook); //Retorno el nuevo registro
    }catch(error){
        //400 -> Bad Request
        res.status(400).json({
            message:error.message
        })
    }
})

router.delete('/:id',getBook,async(req,res)=>{

    try{
        const book=res.book;
        await res.book.deleteOne({
            _id:req.params.id
        });
        res.json(book)
    }catch(error){
        //500 -> Error interno del servidor
        res.status(500).json({
            message:error.message
        })
    }
    
})


//Una vez definidas las rutas hay que exportarlas
module.exports=router
