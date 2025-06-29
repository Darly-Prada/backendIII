import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import { getLogger } from '../utils/logger.js'; 

const logger = getLogger(); 

const register = async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).send({ status: 'error', error: 'Incomplete values' });
      }
  
      const exists = await usersService.getUserByEmail(email);
      if (exists) {
        return res.status(400).send({ status: 'error', error: 'User already exists' });
      }
  
      const hashedPassword = await createHash(password);
      const user = { first_name, last_name, email, password: hashedPassword };
      const result = await usersService.create(user);
  
      return res.status(201).send({ status: 'success', payload: result._id });
    } catch (err) {
      logger.error('Error en register:', err);
      return res.status(500).send({ status: 'error', error: 'Internal server error' });
    }
  };

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ status: "error", error: "Incomplete values" });
        }

        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return res.status(404).send({ status: "error", error: "User doesn't exist" });
        }

        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) {
            return res.status(400).send({ status: "error", error: "Incorrect password" });
        }

        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });

        res.cookie('coderCookie', token, { maxAge: 3600000 });
        return res.status(200).send({
            status: "success",
            message: "Logged in",
            token // ← importante para los tests
        });
    } catch (error) {
        logger.error('Error en login:', error);
        return res.status(500).send({ status: "error", error: error.message });
    }
};

const current = async (req, res) => {
    try {
      const cookie = req.cookies['coderCookie'];
  
      if (!cookie) {
           return res.status(401).send({ status: "error", error: "Unauthorized - No cookie" });
      }
  
      const user = jwt.verify(cookie, 'tokenSecretJWT');
      
      if (user) {
        return res.status(200).send({ status: "success", payload: user });
      } else {
        return res.status(401).send({ status: "error", error: "Unauthorized" });
      }
    } catch (error) {
      logger.error('Error en current:', error);
      return res.status(500).send({ status: "error", error: error.message });
    }
  };

const unprotectedLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Incomplete values" });
    }
    const user = await usersService.getUserByEmail(email);
    if (!user) {
        return res.status(404).send({ status: "error", error: "User doesn't exist" });
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
        return res.status(400).send({ status: "error", error: "Incorrect password" });
    }

    const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });
    return res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" });
};

const unprotectedCurrent = async (req, res) => {
    const cookie = req.cookies['unprotectedCookie'];
    const user = jwt.verify(cookie, 'tokenSecretJWT');
    if (user) {
        return res.status(200).send({ status: "success", payload: user });
    }
    return res.status(401).send({ status: "error", error: "Unauthorized" });
};

export default {
    current,
    login,
    register,
    unprotectedLogin,
    unprotectedCurrent
};