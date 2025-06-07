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
import { useTheme } from '../../../utils/ThemeProvider'; // Using theme context for colors

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AffiliateRevenueChart = ({ commissions }) => {
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        const monthlyData = {};

        if (commissions && commissions.length > 0) {
            commissions.forEach(commission => {
                // Assuming `created_at` or similar field exists on commission records from analytics
                const date = new Date(commission.calculation_date || commission.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += parseFloat(commission.commission_earned);
            });
        }

        const sortedMonths = Object.keys(monthlyData).sort();

        return {
            labels: sortedMonths.map(month => new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })),
            datasets: [
                {
                    label: 'Commission Earned (€)',
                    data: sortedMonths.map(month => monthlyData[month].toFixed(2)),
                    backgroundColor: 'rgba(244, 63, 94, 0.6)', // Tailwind 'rose-500' with opacity
                    borderColor: 'rgba(244, 63, 94, 1)', // Solid 'rose-500'
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [commissions]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: theme === 'dark' ? '#d4d4d4' : '#404040', // neutral-400 or neutral-700
                }
            },
            title: {
                display: false, // Title is handled by the parent page component
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: theme === 'dark' ? '#a3a3a3' : '#737373' }, // neutral-500 or neutral-400
                grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
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
    commissions: PropTypes.arrayOf(PropTypes.shape({
        calculation_date: PropTypes.string, // Assuming this field from analytics
        created_at: PropTypes.string, // Fallback field
        commission_earned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })),
};

AffiliateRevenueChart.defaultProps = {
    commissions: [],
};

export default AffiliateRevenueChart;