/**
 * Base Email Template
 *
 * Provides consistent branding and styling for all emails
 */

import { env } from '@/lib/config/env';

export interface BaseTemplateProps {
	title: string;
	previewText?: string;
	content: string;
	footerText?: string;
}

/**
 * Generate the base HTML email template
 * Responsive design that works across email clients
 */
export function baseTemplate({
	title,
	previewText,
	content,
	footerText
}: BaseTemplateProps): string {
	const appUrl = env.appUrl;
	const appName = env.smtp.fromName;
	const year = new Date().getFullYear();
	// Use LOGO_URL env var for external hosting (e.g., Cloudinary), or fallback to local path
	const logoUrl =
		process.env.EMAIL_LOGO_URL || `${appUrl}/images/easyvill-logo.png`;

	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .content { padding: 20px !important; }
      .button { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
  ${
		previewText
			? `
  <!-- Preview text (hidden) -->
  <div style="display: none; font-size: 1px; color: #f4f4f5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>
  `
			: ''
	}
  
  <!-- Email wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        
        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px; border-bottom: 1px solid #e4e4e7;">
              <a href="${appUrl}" style="text-decoration: none;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <img src="${logoUrl}" alt="${appName}" width="50" height="50" style="display: block; width: 50px; height: 50px; border-radius: 8px;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 12px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
                        ${appName}
                      </h1>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; border-radius: 0 0 8px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    ${
											footerText
												? `<p style="margin: 0 0 16px; font-size: 14px; color: #71717a;">${footerText}</p>`
												: ''
										}
                    <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                      © ${year} ${appName}. All rights reserved.
                    </p>
                    <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa;">
                      <a href="${appUrl}" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Unsubscribe notice -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 24px;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                This email was sent to you because you have an account with ${appName}.
                <br>If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

/**
 * Generate a button component for emails
 */
export function emailButton(
	text: string,
	url: string,
	color: string = '#3b82f6'
): string {
	return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center" style="padding: 24px 0;">
      <a href="${url}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${color}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        ${text}
      </a>
    </td>
  </tr>
</table>
`.trim();
}

/**
 * Generate an info box for emails
 */
export function emailInfoBox(
	content: string,
	type: 'info' | 'warning' | 'success' = 'info'
): string {
	const colors = {
		info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
		warning: { bg: '#fefce8', border: '#eab308', text: '#854d0e' },
		success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' }
	};
	const { bg, border, text } = colors[type];

	return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding: 16px; background-color: ${bg}; border-left: 4px solid ${border}; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: ${text};">
        ${content}
      </p>
    </td>
  </tr>
</table>
`.trim();
}
