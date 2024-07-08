const { Sequelize, DataTypes } = require ("sequelize");

const CADENA_CONEXION = 
    "postgresql://postgres:asuna@3101@localhost:5432/postgres";

const sequelize = new Sequelize(CADENA_CONEXION)

//postgres://postgres:asuna@3101@localhost:5432/ejemplo



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