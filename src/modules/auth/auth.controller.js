import { loginUser, registerUser } from './auth.service.js';

export const registerController = async (req, res, next) => {
  try {
    const usuario = await registerUser(req.body || {});
    return res.status(201).json(usuario);
  } catch (error) {
    return next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const result = await loginUser(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export default {
  registerController,
  loginController
};
