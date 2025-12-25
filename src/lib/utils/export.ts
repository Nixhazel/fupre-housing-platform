/**
 * Export Utilities
 *
 * Functions for exporting data to PDF and CSV formats
 */

import { formatNaira } from './currency';

export interface EarningsExportData {
	agentName: string;
	agentEmail: string;
	period: string;
	totalEarnings: number;
	totalUnlocks: number;
	totalViews: number;
	monthlyData: Array<{
		month: string;
		unlocks: number;
		amount: number;
	}>;
	topListings: Array<{
		title: string;
		area: string;
		price: number;
		views: number;
	}>;
	exportDate: string;
}

/**
 * Generate CSV content from earnings data
 */
export function generateEarningsCSV(data: EarningsExportData): string {
	const lines: string[] = [];

	// Header info
	lines.push('AGENT EARNINGS REPORT');
	lines.push(`Agent Name,${data.agentName}`);
	lines.push(`Agent Email,${data.agentEmail}`);
	lines.push(`Report Period,${data.period}`);
	lines.push(`Export Date,${data.exportDate}`);
	lines.push('');

	// Summary
	lines.push('SUMMARY');
	lines.push(`Total Earnings,${data.totalEarnings}`);
	lines.push(`Total Unlocks,${data.totalUnlocks}`);
	lines.push(`Total Views,${data.totalViews}`);
	lines.push('');

	// Monthly earnings
	lines.push('MONTHLY EARNINGS');
	lines.push('Month,Unlocks,Amount');
	data.monthlyData.forEach((row) => {
		lines.push(`${row.month},${row.unlocks},${row.amount}`);
	});
	lines.push('');

	// Top listings
	lines.push('TOP PERFORMING LISTINGS');
	lines.push('Title,Area,Monthly Price,Views');
	data.topListings.forEach((listing) => {
		// Escape commas in title
		const escapedTitle = listing.title.includes(',')
			? `"${listing.title}"`
			: listing.title;
		lines.push(
			`${escapedTitle},${listing.area},${listing.price},${listing.views}`
		);
	});

	return lines.join('\n');
}

/**
 * Generate HTML content for PDF export
 */
export function generateEarningsPDFHTML(data: EarningsExportData): string {
	const monthlyRows = data.monthlyData
		.map(
			(row) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
							row.month
						}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
							row.unlocks
						}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatNaira(
							row.amount
						)}</td>
        </tr>
    `
		)
		.join('');

	const listingsRows = data.topListings
		.map(
			(listing, index) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
							index + 1
						}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
							listing.title
						}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
							listing.area
						}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatNaira(
							listing.price
						)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${
							listing.views
						}</td>
        </tr>
    `
		)
		.join('');

	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Earnings Report - ${data.agentName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #10b981;
        }
        .header h1 {
            color: #10b981;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            margin: 5px 0;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #f9fafb;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { padding: 20px; }
            .stats-grid { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 EasyVille Estates</h1>
        <h2>Agent Earnings Report</h2>
        <p><strong>${data.agentName}</strong> (${data.agentEmail})</p>
        <p>Period: ${data.period}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${formatNaira(data.totalEarnings)}</div>
            <div class="stat-label">Total Earnings</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.totalUnlocks}</div>
            <div class="stat-label">Location Unlocks</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.totalViews}</div>
            <div class="stat-label">Total Views</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Monthly Earnings Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th style="text-align: center;">Unlocks</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${
									monthlyRows ||
									'<tr><td colspan="3" style="padding: 20px; text-align: center; color: #666;">No earnings data available</td></tr>'
								}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Top Performing Listings</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th>Listing Title</th>
                    <th>Area</th>
                    <th style="text-align: right;">Price/Month</th>
                    <th style="text-align: right;">Views</th>
                </tr>
            </thead>
            <tbody>
                ${
									listingsRows ||
									'<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">No listings data available</td></tr>'
								}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Generated on ${data.exportDate}</p>
        <p>EasyVille Estates - Helping students find their perfect home</p>
    </div>
</body>
</html>
    `;
}

/**
 * Download a file with the given content
 */
export function downloadFile(
	content: string,
	filename: string,
	mimeType: string
) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Export earnings to CSV
 */
export function exportEarningsToCSV(data: EarningsExportData) {
	const csv = generateEarningsCSV(data);
	const filename = `earnings-report-${data.period
		.replace(/\s/g, '-')
		.toLowerCase()}.csv`;
	downloadFile(csv, filename, 'text/csv');
}

/**
 * Export earnings to PDF (opens in new window for printing)
 */
export function exportEarningsToPDF(data: EarningsExportData) {
	const html = generateEarningsPDFHTML(data);
	const printWindow = window.open('', '_blank');

	if (printWindow) {
		printWindow.document.write(html);
		printWindow.document.close();

		// Wait for content to load, then print
		printWindow.onload = () => {
			printWindow.print();
		};
	}
}
