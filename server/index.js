const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { auth } = require("./middleware/auth");

const { User } = require("./models/User");

//'모든코드에 대해'(.use) apalication/x-www-form-urlencoded를 분석해서 가져오게 함
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 분석 / cookieparser
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello! My name is HGB");
});

//LandingPage route(proxy router)
app.get("/api/hello", (req, res) => {
  res.send("안녕하세요! 시험용!");
});

//register route
app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  //회원 가입 할때 필요한 정보들을 client에서 가져오면 그것들을 DB에 넣어준다
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    console.log(userInfo.body);
    return res.status(200).json({ success: true });
  });
});

//login route
app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 DB에서 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "이메일이 존재하지 않습니다. 회원가입을 해주세요!",
      });
    }
    //요청된 이메일이 DB에 있다면 비밀번호가 맞는지 확인, User에서 comparePassword 가져옴
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다",
        });
      //비밀번호까지 맞다면 해당 계정의 토큰 생성(jsonwebtoken 라이브러리 활용), User에서 generateToken 가져옴
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키,로컬스토리지 등 여러 방법 존재, 현재는 쿠키에 저장(cookie-parser 라이브러리 활용)
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

//auth router
app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 말은 Authentication이 True라는 말
  res.status(200).json({
    _id: req.user._id,
    //role 0 이면 일반유저, 0이 아니면 관리자(즉, 바꿀 수 있음)
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//logout route
app.get("/api/users/logout", auth, (req, res) => {
  //logout하려는 유저를 찾아서 토큰을 지워준다
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
