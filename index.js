const { Pool } = require("pg");
const config = {
    user: "postgres",
    host: "localhost",
    database: "estudiantes",
    password: "postgres",
    port: 5432,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

const argumentos = process.argv.slice(2);
const funcion = argumentos[0];
const nombre = argumentos[1];
let rut = argumentos[2];
const curso = argumentos[3];
const nivel = argumentos[4];

pool.connect(async(error_conexion, client, release) => {

    async function ingresar(nombre, rut, curso, nivel) {
        const queryInsert = {
            name: "insert-user",
            text: "INSERT INTO estudiantes(nombre, rut, curso, nivel) values ($1,$2,$3,$4) RETURNING *;",
            values: [nombre, rut, curso, nivel]
        };
        if (error_conexion) return console.error(error_conexion.code);
        try {
            const res = await client.query(queryInsert);
            console.log("Registro Agregado: ", res.rows[0]);
            console.log("Cantidad de registros afectados: ", res.rowCount);
        } catch (e) {
            console.log('Clase de Error:', e.code);
        } finally {
            console.log(`Estudiante con Rut ${rut} ya se encuentra en la Base de Datos.`);
            release();
            pool.end();
        }
    };

    async function consulta() {
        const querySelect = {
            name: "select-users",
            text: "SELECT * FROM estudiantes",
            rowMode: "array"
        };
        if (error_conexion) return console.error(error_conexion.code);
        try {
            const res = await client.query(querySelect);
            console.log('Campos del registro: ', res.fields.map(r => r.name).join(" - "));
            console.log('Registros:', res.rows);
            console.log("Cantidad de registros afectados: ", res.rowCount);
        } catch (e) {
            console.log('Clase de Error:', e.code);
        } finally {
            release();
            pool.end();
        }
    };

    async function editar(nombre, rut, curso, nivel) {
        const queryUpdate = {
            name: "update-user",
            text: "UPDATE estudiantes SET nombre = $1, curso = $3, nivel = $4 WHERE rut = $2 RETURNING *;",
            values: [nombre, rut, curso, nivel]
        };
        if (error_conexion) return console.error(error_conexion.code);
        try {
            const res = await client.query(queryUpdate);
            console.log(`Estudiante ${nombre} editado con éxito.`, res.rows[0]);
            console.log("Cantidad de registros afectados: ", res.rowCount);
        } catch (e) {
            console.log(`Estudiante con Rut ${rut} no se encuentra en la Base de Datos.`);
            console.log('Clase de Error:', e.code);
        } finally {
            release();
            pool.end();
        }
    };

    async function consultaRut(rut) {
        const querySelectRut = {
            name: "select-user-rut",
            text: "SELECT * FROM estudiantes WHERE rut = $1",
            values: [rut]
        }
        if (error_conexion) return console.error(error_conexion.code);
        try {
            const res = await client.query(querySelectRut);
            const filas = res.rowCount;
            if (filas == 1) {
                console.log('Registro a Consultar:', res.rows[0]);
                console.log("Cantidad de registros afectados: ", res.rowCount);
            } else {
                console.log(`Estudiante con Rut ${rut} no se encuentra en la Base de Datos.`);
            }
        } catch (e) {
            console.log('Clase de Error:', e.code);
        } finally {
            release();
            pool.end();
        }
    };

    async function eliminar(rut) {
        const queryDelete = {
            name: "delete-user-rut",
            text: "DELETE FROM estudiantes WHERE rut = $1 RETURNING *;",
            values: [rut]
        };
        console.log('rut :', rut);
        if (error_conexion) return console.error(error_conexion.code);
        try {
            const res = await client.query(queryDelete);
            const filas = res.rowCount;
            if (filas == 1) {
                console.log(`Registro de estudiante con rut ${rut} ha sido eliminado.`, res.rows);
                console.log("Cantidad de registros afectados: ", res.rowCount);
            } else {
                console.log(`Estudiante con Rut ${rut} no se encuentra en la Base de Datos.`);
            }
        } catch (e) {
            console.log('Clase de Error:', e.code);
            // console.log(`Estudiante con Rut ${rut} no se encuentra en la Base de Datos.`);
        } finally {
            release();
            pool.end();
        }
    };

    // Funciones : Nuevo estudiante, Consulta, Editar estudiante, Consultar por rut, Eliminar registro de estudiante

    // Nuevo estudiante: node index.js nuevo <nombre> <rut> <curso> <nivel>
    if (funcion == "nuevo") {
        console.log(nombre, rut, curso, nivel);
        ingresar(nombre, rut, curso, nivel);
    }

    // Consulta estudiante: node index.js consulta
    if (funcion == "consulta") {
        consulta();
    }

    // Editar estudiante: node index.js editar <nombre> <rut> <curso> <nivel>
    if (funcion == "editar") {
        console.log(nombre, rut, curso, nivel);
        editar(nombre, rut, curso, nivel);
    }

    // Consultar por rut estudiante: node index.js rut <rut>
    if (funcion == "rut") {
        let rut = argumentos[1];
        consultaRut(rut);
    }

    // Eliminar registro de estudiante: node index.js eliminar <rut>
    if (funcion == "eliminar") {
        let rut = argumentos[1];
        eliminar(rut);
    }
})