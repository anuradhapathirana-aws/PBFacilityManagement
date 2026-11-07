import * as bookingService from '../services/booking.service.js';

export const list = async (req, res) => res.json(await bookingService.listBookings(req.valid.query));
export const get = async (req, res) => res.json(await bookingService.getBooking(req.valid.params.id));
export const create = async (req, res) => res.status(201).json(await bookingService.createBooking(req.valid.body));
export const update = async (req, res) => res.json(await bookingService.updateBooking(req.valid.params.id, req.valid.body));
export const remove = async (req, res) => {
  await bookingService.deleteBooking(req.valid.params.id);
  res.status(204).end();
};
