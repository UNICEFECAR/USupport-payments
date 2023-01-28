/**
 * Format time from the js Date object Thu Mar 25 2021 00:00:00 GMT+0000 (Greenwich Mean Time) to HH:MM
 *
 * @param {Date} date the formatted js Date object
 * @returns {string} the formatted time HH:MM
 */
export const getTime = (date) => {
  let d = new Date(date),
    timeText = d.toTimeString();

  return timeText.split(" ")[0].slice(0, -3);
};

/**
 * Format date from the js Date object Thu Mar 25 2021 00:00:00 GMT+0000 (Greenwich Mean Time) to DD.MM.YY
 * @param {Date} date the formatted js Date object
 * @returns {string} the formatted date DD.MM.YY
 * @example getDateView(new Date("2021-03-25T00:00:00.000Z")) => "25.03.21"
 *
 */
export const getDateView = (date) => {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const fullYear = newDate.getFullYear();
  const year = fullYear.toString().slice(-2);

  return `${day < 10 ? `0${day}` : day}.${
    month < 10 ? `0${month}` : month
  }.${year}`;
};
