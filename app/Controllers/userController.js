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

        // Simpan token JWT dalam penyimpanan lokal di frontend
        // Sertakan token dalam respons JSON
        return res.status(201).json({ user: user, token: token });
      } else {
        return res.status(401).send("Authentication failed");
      }
    } else {
      return res.status(401).send("Authentication failed");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
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
    const userId = req.query.id; // Mengambil ID pengguna dari parameter query

    // Validasi: Pastikan `userId` ada dan merupakan angka
    if (!userId || isNaN(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const { fullname, userName, email, password } = req.body;

    // Mempersiapkan data yang akan diperbarui
    const updatedData = {};
    if (fullname) updatedData.fullname = fullname;
    if (userName) updatedData.userName = userName;
    if (email) updatedData.email = email;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    // Melakukan pembaruan data
    const [updatedRows, [updatedUser]] = await User.update(updatedData, {
      where: { id: userId },
      returning: true, // Mengembalikan baris yang diperbarui (hanya untuk PostgreSQL)
    });

    if (updatedRows === 0) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json(updatedUser); // Mengembalikan pengguna yang diperbarui

  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.query.id; // Mengambil ID pengguna dari parameter query

    // Validasi: Pastikan `userId` ada dan merupakan angka
    if (!userId || isNaN(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const deletedRows = await User.destroy({
      where: { id: userId }
    });

    if (deletedRows === 0) {
      return res.status(404).send("User not found");
    }

    return res.status(200).send("User deleted successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};