const Medicine = require('../models/Medicine');
const { isPharmacyOpenNow } = require('../utils/pharmacyHours');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const toPharmacyResponse = (pharmacy, distance) => {
  const data = pharmacy.toObject ? pharmacy.toObject() : pharmacy;
  const [longitude, latitude] = data.location?.coordinates || [];

  const { password, ...safeData } = data;

  return {
    ...safeData,
    latitude,
    longitude,
    isOpen: isPharmacyOpenNow(safeData.openingDays, safeData.openingHours),
    distance,
  };
};

exports.searchMedicines = async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const maxDistanceKm = Number(req.query.maxDistance || 25);

    if (!query) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { dosage: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } },
      ],
      inStock: true,
      quantity: { $gt: 0 },
    })
      .populate('pharmacyId', '-password')
      .sort({ name: 1 });

    const pharmaciesById = new Map();

    medicines.forEach((medicine) => {
      const pharmacy = medicine.pharmacyId;
      if (!pharmacy) return;

      const [pharmacyLongitude, pharmacyLatitude] = pharmacy.location?.coordinates || [];
      const hasLocation =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        Number.isFinite(pharmacyLatitude) &&
        Number.isFinite(pharmacyLongitude);
      const distance = hasLocation
        ? calculateDistance(latitude, longitude, pharmacyLatitude, pharmacyLongitude)
        : undefined;

      if (distance !== undefined && distance > maxDistanceKm) {
        return;
      }

      const pharmacyId = pharmacy._id.toString();
      if (!pharmaciesById.has(pharmacyId)) {
        pharmaciesById.set(pharmacyId, {
          ...toPharmacyResponse(pharmacy, distance),
          matchingMedicines: [],
        });
      }

      pharmaciesById.get(pharmacyId).matchingMedicines.push({
        _id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        imageUrl: medicine.imageUrl,
        price: medicine.price,
        quantity: medicine.quantity,
        unit: medicine.unit,
        dosage: medicine.dosage,
        manufacturer: medicine.manufacturer,
        inStock: medicine.inStock,
      });
    });

    const pharmacies = Array.from(pharmaciesById.values()).sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    res.json({
      message: 'Medicine search completed successfully',
      pharmacies,
      count: pharmacies.length,
    });
  } catch (error) {
    console.error('Search medicines error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPharmacyMedicines = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    console.log('Getting medicines for pharmacy:', pharmacyId);

    const medicines = await Medicine.find({ pharmacyId }).sort({ createdAt: -1 });

    res.json({
      message: 'Medicines retrieved successfully',
      medicines,
      count: medicines.length,
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { name, description, imageUrl, price, quantity, unit, expiryDate, dosage, manufacturer } = req.body;

    console.log('Adding medicine:', { name, price, quantity });

    if (!name || !price || quantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    const medicine = new Medicine({
      pharmacyId,
      name,
      description,
      imageUrl,
      price,
      quantity,
      unit,
      expiryDate,
      dosage,
      manufacturer,
      inStock: quantity > 0,
    });

    await medicine.save();

    res.status(201).json({
      message: 'Medicine added successfully',
      medicine,
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { name, description, imageUrl, price, quantity, unit, expiryDate, dosage, manufacturer } = req.body;

    console.log('Updating medicine:', medicineId);

    const medicine = await Medicine.findByIdAndUpdate(
      medicineId,
      {
        name,
        description,
        imageUrl,
        price,
        quantity,
        unit,
        expiryDate,
        dosage,
        manufacturer,
        inStock: quantity > 0,
      },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      message: 'Medicine updated successfully',
      medicine,
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    console.log('Deleting medicine:', medicineId);

    const medicine = await Medicine.findByIdAndDelete(medicineId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      message: 'Medicine deleted successfully',
      medicine,
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: error.message });
  }
};
