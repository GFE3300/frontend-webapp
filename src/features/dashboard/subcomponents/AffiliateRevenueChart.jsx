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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AffiliateRevenueChart = ({ commissions }) => {

    const chartData = useMemo(() => {
        const monthlyData = {};

        if (commissions && commissions.length > 0) {
            commissions.forEach(commission => {
                const date = new Date(commission.calculation_date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += parseFloat(commission.commission_earned);
            });
        }
        
        // Sort months chronologically
        const sortedMonths = Object.keys(monthlyData).sort();

        return {
            labels: sortedMonths.map(month => new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })),
            datasets: [
                {
                    label: 'Commission Earned (€)',
                    data: sortedMonths.map(month => monthlyData[month].toFixed(2)),
                    backgroundColor: 'rgba(244, 63, 94, 0.6)', // rose-500 with opacity
                    borderColor: 'rgba(244, 63, 94, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [commissions]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: document.documentElement.classList.contains('dark') ? '#d4d4d4' : '#404040',
                }
            },
            title: {
                display: false,
                text: 'Monthly Commission Earnings',
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
                ticks: { color: document.documentElement.classList.contains('dark') ? '#a3a3a3' : '#737373' },
                grid: { color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
            },
            x: {
                ticks: { color: document.documentElement.classList.contains('dark') ? '#a3a3a3' : '#737373' },
                grid: { display: false },
            },
        },
    };

    return (
        <div style={{ height: '300px' }}>
            <Bar options={options} data={chartData} />
        </div>
    );
};

AffiliateRevenueChart.propTypes = {
    commissions: PropTypes.array,
};

AffiliateRevenueChart.defaultProps = {
    commissions: [],
};

export default AffiliateRevenueChart;