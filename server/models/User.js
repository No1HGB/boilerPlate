const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: { type: String, maxlength: 50 },
  email: { type: String, trim: true, unique: 1 },
  password: { type: String, minlength: 5 },
  lastname: { type: String, maxlength: 50 },
  role: { type: Number, default: 0 },
  image: String,
  token: { type: String },
  tokenExp: { type: Number },
});

//user정보를 저장하기 전(index.js에서 user.save 실행 전) 실행됨
userSchema.pre("save", function (next) {
  var user = this; //위 데어터 user변수로 선언
  //비밀번호를 바꿀때만 암호화
  if (user.isModified("password")) {
    //비밀번호 암호화(bcrypt 사이트에서 가져옴)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash; // plainPassword를 hash(암호화)된 비밀번호로
        next();
      });
    });
  } else {
    next();
  }
});

//comparePassword 메소드 만들기, cb=callback함수(index에서 활용시 cb변수자리에 콜백함수 들어감)
userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword와  암호화된 비밀번호가 같은지 체크
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
//generateToken 메소드 만들기
userSchema.methods.generateToken = function (cb) {
  var user = this;
  //jsonwebtoken을 이용해서 token을 생성, jsonwebtoken 사이트 참조
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  //user._id + 'secretToken' = token
  //'secretToken'을 넣으면 user._id를 알 수 있음
  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  //토큰을 복호화 한다.(jsonwebtoken에 나와있음)
  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저ID를 이용해서 유저를 찾은 다음, 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
