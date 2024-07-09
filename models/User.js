//const { Sequelize, DataTypes } = require ("sequelize");

//const CADENA_CONEXION = 
    //"postgresql://postgres:asuna@3101@postgres2024-1.postgres.database.azure.com:5432/postgresSQL";
//postgresSQL



//const sequelize = new Sequelize(CADENA_CONEXION)
const { Sequelize,DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresSQL', 'postgres', 'asuna@3101', {
    host: 'postgres2024-1.postgres.database.azure.com',
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false 
        }
    }
});





const usuario = sequelize.define("usuarios",{
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Corrected default value for UUID
    allowNull: false
  },
  nombre : {
      type : DataTypes.STRING(20),
      allowNull : true
  },
  apellido : {
      type : DataTypes.STRING(40),
      allowNull : true
  },
  correo : {
      type : DataTypes.STRING(40),
      allowNull : false
  },
  password : {
      type : DataTypes.STRING(40),
      allowNull : false
  },
  recovery_password : {
    type : DataTypes.STRING(40),
    allowNull : true
  }
  
},{
  timestamps : false,
  freezeTableName : true
})

module.exports = {
  usuario, sequelize
}