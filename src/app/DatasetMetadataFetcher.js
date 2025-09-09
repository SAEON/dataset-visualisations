import {useState, useEffect, useMemo} from 'react';

// The base URL for your FastAPI server
const API_BASE_URL = 'http://localhost:8000';

/**
 * A custom React hook for fetching dataset metadata from the API.
 * It handles loading, error, and memoization of time-related data.
 * @param {string} datasetId The ID of the dataset to fetch.
 * @returns {{data: Object, loading: boolean, error: string, timeMarks: Array, times: Array}}
 */
export const useDatasetData = (datasetId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the data from the FastAPI endpoint
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/dataset_meta/${datasetId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [datasetId]); // Re-fetch data if the datasetId changes

    // Generate dynamic time marks for the slider and memoize them
    const {timeMarks, times} = useMemo(() => {
        if (!data) {
            return {timeMarks: [], times: []};
        }

        const {start_date, end_date, time_step_minutes} = data;
        const times = [];
        const currentTime = new Date(start_date + 'Z'); // Treat start_date as UTC
        const endDate = new Date(end_date + 'Z');     // Treat end_date as UTC
        const stepMs = time_step_minutes * 60 * 1000;

        while (currentTime <= endDate) {
            times.push(currentTime.toISOString());
            currentTime.setTime(currentTime.getTime() + stepMs);
        }

        const timeMarks = times.map((timeString, index) => {
            const date = new Date(timeString);
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            return {
                value: index,
                label: `${hours}:${minutes}`,
            };
        });

        return {timeMarks, times};
    }, [data]);

    return {data, loading, error, timeMarks, times};
};
