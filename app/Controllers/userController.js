const bcrypt = require("bcrypt");
const db = require("../Models");
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;
const User = db.users;

exports.signup = async (req, res) => {
  try {
    const { fullname, userName, email, password } = req.body;
    const data = {
      fullname,
      userName,
      email,
      password: await bcrypt.hash(password, 10),
    };
    const user = await User.create(data);

    if (user) {
      let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: 1 * 24 * 60 * 60 * 1000,
      });

      res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
      console.log("user", JSON.stringify(user, null, 2));
      console.log(token);
      return res.status(201).send(user);
    } else {
      return res.status(409).send("Details are not correct");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      const isSame = await bcrypt.compare(password, user.password);

      if (isSame) {
        let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        });

        res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
        console.log("user", JSON.stringify(user, null, 2));
        console.log(token);
        return res.status(201).json({ userName: user.userName, token: token });
      } else {
        return res.status(401).send("Authentication failed");
      }
    } else {
      return res.status(401).send("Authentication failed");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const name = req.query.fullname;
    const username = req.query.username;
    const email = req.query.email;
    var byName = name ? { fullname: { [Op.like]: `%${name}%` } } : null;
    var byEmail = email ? { email: { [Op.like]: `%${email}%` } } : null;
    var byUserName = username
      ? { userName: { [Op.like]: `%${username}%` } }
      : null;

    const users = await User.findAll({
      where: byName || byEmail || byUserName,
      attributes: { exclude: ["password"] },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.editUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const { fullname, userName, email, password } = req.body;
  
      const updatedData = {};
      if (fullname) updatedData.fullname = fullname;
      if (userName) updatedData.userName = userName;
      if (email) updatedData.email = email;
      if (password) updatedData.password = await bcrypt.hash(password, 10);
  
      const user = await User.update(updatedData, {
        where: {
          id: userId,
        },
        returning: true,
        plain: true,
      });
  
      if (user) {
        return res.status(200).json(user[1]); // user[1] contains the updated user object
      } else {
        return res.status(404).send("User not found");
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Error");
    }
  };