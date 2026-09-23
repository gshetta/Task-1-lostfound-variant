import { Item } from '../models/Item.js';
import Joi from 'joi';


// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().optional(),
  category: Joi.string()
    .valid('electronics', 'clothing', 'documents', 'accessories', 'other')
    .default('other'),
  status: Joi.string()
    .valid('lost', 'found', 'claimed')
    .default('lost'),
  location: Joi.string().trim().optional(),
  reportedBy: Joi.string().hex().length(24).optional()
});

const updateSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  category: Joi.string().valid('electronics', 'clothing', 'documents', 'accessories', 'other'),
  status: Joi.string().valid('lost', 'found', 'claimed'),
  location: Joi.string().trim(),
  reportedBy: Joi.string().hex().length(24)
});
// GET /api/items
// TODO: implement per README.md section 3.
export async function getAllItems(req, res, next) {
  try {
    // TODO
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const items = await Item.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (err) { next(err); }
}

// GET /api/items/:id
// TODO: implement per README.md section 3.
export async function getItem(req, res, next) {
  try {
    // TODO
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'item not found' });
    }

    res.json({ item });
  } catch (err) { next(err); }
}

// POST /api/items
// TODO: implement per README.md section 3.
export async function createItem(req, res, next) {
  try {
    // TODO
    const { value, error } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const item = await Item.create(value);
    res.status(201).json({ item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An item with this title already exists at this location' });
    }
    next(err);
  }
}

// PATCH /api/items/:id
// TODO: implement per README.md section 3.
export async function updateItem(req, res, next) {
  try {
    // TODO
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const doc = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item: doc });
  } catch (err) {if (err.code === 11000) {
      return res.status(409).json({ message: 'An item with this title already exists at this location' });
    } next(err); }
}

// DELETE /api/items/:id
// TODO: implement per README.md section 3.
export async function deleteItem(req, res, next) {
  try {
    // TODO
    const doc = await Item.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
}
