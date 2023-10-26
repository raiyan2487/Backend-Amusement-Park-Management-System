const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");

exports.SignupStructure = (req, res) => {
        console.log(req.body);
    
        const {
            userid,
            name,
            email,
            Number,
            password,
            passwordConfirm,
        } = req.body;
    
        db.query(
            "SELECT UserID FROM users WHERE UserID = ?",
            [userid],
            async (error, results) => {
                console.log(results);
    
                if (error) {
                    console.log(error);
                }
                if (results.length > 0) {
                    return res.status(400).send("That Username is already taken :(");
                } else if (password !== passwordConfirm) {
                    return res.status(400).send("Password does not match");
                }
    
                let hashedPassword = await bcrypt.hash(password, 8);
                console.log(hashedPassword);
    
                db.query(
                    "INSERT INTO users SET ?",
                    {
                        Number: Number,
                        UserID: userid,
                        Password: hashedPassword,
                        Email: email,
                        Name: name,
                    },
                    (error, results) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(results);
                            return res.status(400).send("User Registered");
                        }
                    }
                );
            }
        );
    };

exports.LoginStructure = async (req, res) => {
        try {
            const { userid, password } = req.body;
    
            if (!userid || !password) {
                return res.status(400).send("Please provide userid and password");
            }
    
            db.query(
                "SELECT * FROM users WHERE UserID = ?",
                [userid],
                async (error, results) => {
                    console.log(results);
    
                    if (
                        !results ||
                        !(await bcrypt.compare(password, results[0].Password))
                    ) {
                        res.status(401).send("Incorrect userid or password");
                    } else {
                        const id = results[0].id;
                        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                            expiresIn: "1h",
                        });
    
                        console.log("The token is: " + token);
    
                        const cookieOptions = {
                            expires: new Date(
                                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                            ),
                            httpOnly: true,
                        };
    
                        res.cookie("jwt", token, cookieOptions);
                        res.status(200).send("Logged in successfully");
                    }
                }
            );
        } catch (error) {
            console.log(error);
        }
    };



  
