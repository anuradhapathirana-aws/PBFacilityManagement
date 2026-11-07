import * as authService from '../services/auth.service.js';

export const login = async (req, res) => res.json(await authService.login(req.valid.body));
export const me = async (req, res) => res.json({ admin: req.admin });
