let rankChart = null;

async function loadChartData() {
    try {
        const response = await fetch('rank_history.json');
        const historyData = await response.json();
        const timestamps = Object.keys(historyData).sort().slice(-24);

        const datasets = {
            melon_top100: { label: 'Melon Top 100', data: [], borderColor: '#00cd3c', backgroundColor: 'rgba(0, 205, 60, 0.1)' },
            melon_hot100: { label: 'Melon Hot 100', data: [], borderColor: '#ff6384', backgroundColor: 'rgba(255, 99, 132, 0.1)' },
            bugs: { label: 'Bugs', data: [], borderColor: '#ff3b30', backgroundColor: 'rgba(255, 59, 48, 0.1)' },
            genie: { label: 'Genie', data: [], borderColor: '#00a0e0', backgroundColor: 'rgba(0, 160, 224, 0.1)' },
            vibe: { label: 'Vibe', data: [], borderColor: '#6f42c1', backgroundColor: 'rgba(111, 66, 193, 0.1)' },
            flo: { label: 'Flo', data: [], borderColor: '#3b9fff', backgroundColor: 'rgba(59, 159, 255, 0.1)' }
        };

        timestamps.forEach(timestamp => {
            const data = historyData[timestamp];
            for (const service in datasets) {
                let rank = data[service] && data[service][0] ? data[service][0].rank : null;
                if (service === 'genie' && rank > 100) {
                    rank = null; // 100위 초과는 그래프에 표시하지 않음
                }
                datasets[service].data.push(rank);
            }
        });

        const chartData = {
            labels: timestamps.map(t => new Date(t).toLocaleTimeString()),
            datasets: Object.values(datasets).map(d => ({
                ...d,
                fill: true,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: d.borderColor,
                tension: 0.3
            }))
        };

        const ctx = document.getElementById('rankChart').getContext('2d');
        if (rankChart) {
            rankChart.destroy();
        }
        rankChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        reverse: true,
                        beginAtZero: false,
                        ticks: {
                            stepSize: 10
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });

    } catch (error) {
        console.error('차트 데이터 로드 실패:', error);
    }
}