
const jwt = require("jsonwebtoken");

const JWT_SECRET = "Super-Secret";

const payload = {
  username: "bobuser",
  firstName: "Bob",
  lastName: "User"
};

const options = {
  subject: payload.username,
  expiresIn: "7d"
};

const token = jwt.sign(payload, JWT_SECRET, options);

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log(decoded);
} catch (err) {
  console.error(err);
}

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZ1bGxuYW1lIjoiIiwidXNlcm5hbWUiOiJib2J1c2VyIiwiaWQiOiI1YmQ5YjEzMjA1OTljMjA4MzRiYjdlMGEifSwiaWF0IjoxNTQxMDAwOTUyLCJleHAiOjE1NDE2MDU3NTIsInN1YiI6ImJvYnVzZXIifQ.WuxeX_RrVjzhHMjaGnP0QV6BpcUTGQRM8KdGV1Iaql0";

console.log(Buffer.from(authToken.split(".")[0], "base64").toString());
console.log(Buffer.from(authToken.split(".")[1], "base64").toString());

// EPOCH: Number of seconds since Jan 1 1970 (1970-01-01T00:00:00Z UTC)
const d = new Date(0);
console.log(d.setUTCSeconds(1540910968));
console.log(d.toLocaleString());
