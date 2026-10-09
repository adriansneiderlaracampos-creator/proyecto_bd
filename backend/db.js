const mysql = require("mysql2");

//configuracion de la conexion
const conexion = mysql.createConnection({
    host: "localhost", // servidor local
    user:"root",        // Usuario de mysql (por defecto en XAMPP)
    database: "tienda" // Nombre de nuestra BD
})

// Comprobar si la conexion fue exitosa

conexion.connect((error) =>{
    if (error) {
        console.error("Error al conectar con MySQL:", error);
        return;
    }
    console.log("Conexion exitosa con MySQL");
});
// Exportar la conexion para reutilizarla en las rutas del servidor
module.exports =conexion;