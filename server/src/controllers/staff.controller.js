import * as staffService from '../services/staff.service.js';
import * as bookingService from '../services/booking.service.js';

export const list = async (req, res) => res.json({ items: await staffService.listStaff(req.valid.query) });
export const get = async (req, res) => res.json(await staffService.getStaff(req.valid.params.id));
export const create = async (req, res) => res.status(201).json(await staffService.createStaff(req.valid.body));
export const update = async (req, res) => res.json(await staffService.updateStaff(req.valid.params.id, req.valid.body));
export const remove = async (req, res) => {
  await staffService.deleteStaff(req.valid.params.id);
  res.status(204).end();
};
export const bookings = async (req, res) => {
  const staff = await staffService.getStaff(req.valid.params.id);
  res.json({ staff, ...(await bookingService.bookingsForStaff(staff.id, req.valid.query)) });
};
