const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const parseTimeToMinutes = (time) => {
  if (typeof time !== 'string') return null;

  const [hours, minutes] = time.split(':').map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const isPharmacyOpenNow = (openingDays = {}, openingHours = {}, now = new Date()) => {
  const openMinutes = parseTimeToMinutes(openingHours.open || '08:00');
  const closeMinutes = parseTimeToMinutes(openingHours.close || '20:00');

  if (openMinutes === null || closeMinutes === null) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = DAY_NAMES[now.getDay()];

  if (openMinutes <= closeMinutes) {
    return Boolean(openingDays[today]) && currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  const yesterday = DAY_NAMES[(now.getDay() + 6) % 7];
  return (
    (Boolean(openingDays[today]) && currentMinutes >= openMinutes) ||
    (Boolean(openingDays[yesterday]) && currentMinutes <= closeMinutes)
  );
};

module.exports = {
  isPharmacyOpenNow,
};
