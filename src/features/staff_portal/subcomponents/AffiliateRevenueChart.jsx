import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useTheme } from '../../../utils/ThemeProvider';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * A responsive bar chart that visualizes an affiliate's monthly commission earnings.
 * It processes raw commission data, aggregates it by month, and displays it
 * with theme-aware styling for light and dark modes.
 */
const AffiliateRevenueChart = ({ commissions }) => {
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        const monthlyData = {};

        if (commissions && commissions.length > 0) {
            commissions.forEach(commission => {
                // Use `created_at` as the reliable date source from the API.
                const date = new Date(commission.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                // Add the commission amount, ensuring it's a number.
                monthlyData[monthKey] += parseFloat(commission.amount || 0);
            });
        }

        const sortedMonths = Object.keys(monthlyData).sort();

        return {
            labels: sortedMonths.map(month => new Date(month + '-02').toLocaleString('default', { month: 'short', year: 'numeric' })),
            datasets: [
                {
                    label: 'Commission Earned',
                    data: sortedMonths.map(month => monthlyData[month].toFixed(2)),
                    backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(22, 163, 74, 0.6)', // Tailwind green-500/600
                    borderColor: theme === 'dark' ? 'rgba(34, 197, 94, 1)' : 'rgba(22, 163, 74, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(22, 163, 74, 0.8)',
                },
            ],
        };
    }, [commissions, theme]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // The dataset label is clear enough
            },
            title: {
                display: false, // Title is handled by the parent component
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
                titleColor: theme === 'dark' ? '#f5f5f5' : '#404040',
                bodyColor: theme === 'dark' ? '#d4d4d4' : '#525252',
                borderColor: theme === 'dark' ? '#525252' : '#e5e5e5',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: theme === 'dark' ? '#a3a3a3' : '#737373' }, // neutral-400 / neutral-500
                grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' },
            },
            x: {
                ticks: { color: theme === 'dark' ? '#a3a3a3' : '#737373' },
                grid: { display: false },
            },
        },
    }), [theme]);

    return (
        <div style={{ height: '300px' }}>
            <Bar options={options} data={chartData} />
        </div>
    );
};

AffiliateRevenueChart.propTypes = {
    /**
     * An array of commission objects, each expected to have `created_at` and `amount`.
     */
    commissions: PropTypes.arrayOf(PropTypes.shape({
        created_at: PropTypes.string.isRequired,
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })),
};

AffiliateRevenueChart.defaultProps = {
    commissions: [],
};

export default AffiliateRevenueChart;