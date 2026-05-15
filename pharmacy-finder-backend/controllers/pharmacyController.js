const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const { isPharmacyOpenNow } = require('../utils/pharmacyHours');

const toPharmacyResponse = (pharmacy) => {
  const data = pharmacy.toObject ? pharmacy.toObject() : pharmacy;
  const [longitude, latitude] = data.location?.coordinates || [];

  return {
    ...data,
    latitude,
    longitude,
    isOpen: isPharmacyOpenNow(data.openingDays, data.openingHours),
    distance:
      typeof data.distance === 'number'
        ? Math.round(data.distance * 10) / 10
        : undefined,
  };
};

exports.getNearbyPharmacies = async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const maxDistanceKm = Number(req.query.maxDistance || 10);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    const pharmacies = await Pharmacy.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceKm * 1000,
          spherical: true,
        },
      },
      {
        $addFields: {
          distance: { $divide: ['$distanceMeters', 1000] },
          longitude: { $arrayElemAt: ['$location.coordinates', 0] },
          latitude: { $arrayElemAt: ['$location.coordinates', 1] },
        },
      },
      {
        $project: {
          password: 0,
          distanceMeters: 0,
        },
      },
    ]);

    res.json({
      message: 'Nearby pharmacies retrieved successfully',
      pharmacies: pharmacies.map((pharmacy) => ({
        ...pharmacy,
        isOpen: isPharmacyOpenNow(pharmacy.openingDays, pharmacy.openingHours),
        distance: Math.round((pharmacy.distance || 0) * 10) / 10,
      })),
    });
  } catch (error) {
    console.error('Get nearby pharmacies error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().select('-password').sort({ pharmacyName: 1 });

    res.json({
      message: 'Pharmacies retrieved successfully',
      pharmacies: pharmacies.map(toPharmacyResponse),
    });
  } catch (error) {
    console.error('Get pharmacies error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.pharmacyId).select('-password');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(toPharmacyResponse(pharmacy));
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const authenticatedPharmacyId = req.user.id || req.user.pharmacyId;

    if (req.user.userType !== 'admin' || authenticatedPharmacyId !== pharmacyId) {
      return res.status(403).json({ message: 'You can only update your own pharmacy' });
    }

    const allowedFields = ['pharmacyName', 'address', 'phone', 'openingDays', 'openingHours'];
    const updates = allowedFields.reduce((values, field) => {
      if (req.body[field] !== undefined) {
        values[field] = req.body[field];
      }
      return values;
    }, {});

    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      const latitude = Number(req.body.latitude);
      const longitude = Number(req.body.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({ message: 'Valid latitude and longitude are required' });
      }

      updates.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(pharmacyId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({
      message: 'Pharmacy updated successfully',
      pharmacy: toPharmacyResponse(pharmacy),
    });
  } catch (error) {
    console.error('Update pharmacy error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPharmacyStats = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    console.log('Getting stats for pharmacy:', pharmacyId);

    const totalMedicines = await Medicine.countDocuments({ pharmacyId });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
      pharmacyId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const lowStockMedicines = await Medicine.countDocuments({
      pharmacyId,
      quantity: { $lte: 5 },
    });

    res.json({
      message: 'Stats retrieved successfully',
      stats: {
        totalMedicines,
        todayOrders: todayOrders.length,
        todayRevenue,
        lowStockItems: lowStockMedicines,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPharmacyDetails = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const pharmacy = await Pharmacy.findById(pharmacyId).select('-password');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(toPharmacyResponse(pharmacy));
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({ message: error.message });
  }
};
