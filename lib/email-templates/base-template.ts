// lib/email-templates/base-template.ts
interface BaseEmailProps {
  title: string;
  preheader?: string;
  content: string;
}

export function getBaseEmailTemplate({ title, preheader, content }: BaseEmailProps) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${preheader ? `<meta name="description" content="${preheader}">` : ''}
      </head>
      <body style="
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      ">
        <div style="
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <div style="
            text-align: center;
            margin-bottom: 30px;
          ">
            <h1 style="
              color: #2563eb;
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            ">${title}</h1>
          </div>

          ${content}

          <div style="
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 14px;
          ">
            <p style="
              margin: 10px 0 0 0;
              font-size: 12px;
              color: #999;
            ">
              Sent by Vocabry
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
