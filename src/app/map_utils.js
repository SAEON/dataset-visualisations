/**
 * This file contains constants and helper functions for the map viewer.
 * All functions are pure and have no side effects on the component state.
 */
// Get the center of the bounding box for the map
export const actualDataBounds = [14.5, -36.09, 19.99, -29.15];
export const getCenter = (bounds) => {
  return [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
};
export const center = getCenter(actualDataBounds);

// Color scale for the temperature thresholds
export const temperatureColors = [
  [0, 0, 150, 200], // Dark Blue
  [0, 50, 200, 200],
  [0, 100, 255, 200],
  [0, 150, 200, 200],
  [0, 200, 100, 200],
  [100, 200, 0, 200],
  [255, 255, 0, 200], // Yellow
  [255, 165, 0, 200],
  [255, 100, 0, 200],
  [255, 50, 0, 200],
  [200, 0, 0, 200], // Dark Red
];

// Hardcoded depths and marks for the slider
export const depths = [-1000, -500, -100, -50, -10, -5, 0];
export const depthMarks = depths.map((d, index) => ({
  value: index,
  label: d.toString(),
}));

/**
 * Gets the fill color for a map tile based on its temperature and the fetched thresholds.
 * @param {object} d The tile data object.
 * @param {number} currentDepth The currently selected depth.
 * @param {Array} temperatureThresholds The thresholds fetched from the API.
 * @returns {Array} The RGBA color array for the tile.
 */
export const getFillColor = (d, currentDepth, temperatureThresholds) => {
  const temperature = d.properties.temperature;

  const currentThresholds = temperatureThresholds.find(
    (t) => t.dependant_value === currentDepth
  );

  if (!currentThresholds) {
    return [0, 0, 0, 100];
  }

  const { min_value, max_value } = currentThresholds;
  const normalizedTemp = (temperature - min_value) / (max_value - min_value);
  const colorIndex = Math.floor(normalizedTemp * (temperatureColors.length - 1));
  const finalIndex = Math.max(0, Math.min(colorIndex, temperatureColors.length - 1));

  return temperatureColors[finalIndex];
};
