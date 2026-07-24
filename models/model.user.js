const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true,
  },
  profilePhoto: { type: String, default: "" },
  googleId: { type: String, unique: true, sparse: true }, //sprs is for thos who dont have google id
});

const UserModel = mongoose.model("AvanyaUser", UserSchema);
module.exports = UserModel;
