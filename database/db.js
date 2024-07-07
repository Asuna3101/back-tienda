import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize("ejemplo","asuna@3101","postgres", {
  host: "localhost",
  dialect: "postgres"
});

