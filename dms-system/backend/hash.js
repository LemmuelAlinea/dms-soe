const bcrypt = require("bcryptjs");

const password = "admin123"; // change if you want

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});