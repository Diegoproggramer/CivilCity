// app.js - Main application logic

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('crypto-table-body');
    if (tableBody) {
        populateCryptoTable();
    }
});

function populateCryptoTable() {
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = ''; // Clear existing data

    cryptoData.forEach(coin => {
        const row = document.createElement('tr');

        const changeClass = coin.change >= 0 ? 'positive-change' : 'negative-change';
        const changeSign = coin.change >= 0 ? '+' : '';

        row.innerHTML = `
            <td>
                <div class="crypto-info">
                    <img src="${coin.logo}" alt="${coin.name} logo">
                    <div class="crypto-name">
                        <span>${coin.name}</span>
                        <span class="ticker">${coin.ticker}</span>
                    </div>
                </div>
            </td>
            <td>$${coin.priceUSD.toLocaleString()}</td>
            <td>${coin.priceSellIR}</td>
            <td>${coin.priceBuyIR}</td>
            <td class="${changeClass}">${changeSign}${coin.change}%</td>
            <td>
                <div class="chart-placeholder" style="background-image: url('${coin.chartImage}')"></div>
            </td>
            <td>
                <a href="#" class="buy-sell-btn">خرید و فروش</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
