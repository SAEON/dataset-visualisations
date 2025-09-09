/**
 * This file contains constants and helper functions for the map viewer.
 * All functions are pure and have no side effects on the component state.
 */
export const center = [23.2, -31.7];

// Color scale for temperature and salinity. The prompt asks to use the same colors, so we'll just have one.
export const variableColors = [
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
 * Gets the fill color for a map tile based on the selected variable and its min/max thresholds.
 * @param {object} d The tile data object.
 * @param {object} currentThreshold The single threshold object for the current variable, time, and depth.
 * @param {string} selectedLayer The name of the currently selected variable (e.g., 'temperature', 'salinity').
 * @returns {Array} The RGBA color array for the tile.
 */
export const getFillColor = (d, currentThreshold, selectedLayer) => {
    // Get the value of the selected variable from the tile's properties
    const value = d.properties[selectedLayer];

    // If there's no threshold data, return a transparent color
    if (!currentThreshold) {
        return [0, 0, 0, 0];
    }

    // Use min and max values to normalize the data for the color scale
    const { min_value, max_value } = currentThreshold;
    const normalizedValue = (value - min_value) / (max_value - min_value);

    // Calculate the index in the color array
    const colorIndex = Math.floor(normalizedValue * (variableColors.length - 1));
    const finalIndex = Math.max(0, Math.min(colorIndex, variableColors.length - 1));

    return variableColors[finalIndex];
};