import { Router, Request, Response } from 'express';

const routes = Router();

// provisory route
routes.get('/', async (req, res, next) => {
  try {
    res.status(200).json({ message: 'sup' });
  } catch (error) {
    next(error);
  }
});

export default routes;
