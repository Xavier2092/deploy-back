require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DATABASE_URL } = process.env;

const sequelize = new Sequelize(
  DATABASE_URL,
  {
    logging: false,
    native: false,
//CONFIGURACION DB HEROKU
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
    }
  },
});
const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

modelDefiners.forEach((model) => model(sequelize));

let capsEntries = Object.entries(sequelize.models)?.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

const { User, Film, Country, Genre, Comment, Plans } = sequelize.models;

User.belongsToMany(Film, {
  through: "favorito",
  timestamps: false,
});
Film.belongsToMany(User, {
  through: "favorito",
  timestamps: false,
});

Country.hasMany(Film);
Film.belongsTo(Country);

Film.belongsToMany(Genre, {
  through: "filmGenre",
  timestamps: false,
});
Genre.belongsToMany(Film, {
  through: "filmGenre",
  timestamps: false,
});

User.hasMany(Film);
Film.belongsTo(User);

User.hasMany(Comment);
Comment.belongsTo(User);

Plans.hasMany(User);
User.belongsTo(Plans);

Film.hasMany(Comment);
Comment.belongsTo(Film);

Comment.hasMany(Comment);
Comment.belongsTo(Comment);

module.exports = {
  ...sequelize.models,
  connect: sequelize,
};
