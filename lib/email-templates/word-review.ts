// lib/email-templates/word-review.ts
interface WordToReview {
  word: string;
  definition: string;
  context?: string | null;
}

export function getWordReviewTemplate(words: WordToReview[]) {
  const subject = `Word Review Reminder - ${words.length} words to review`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
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
            ">Time to Review Your Words</h1>
            <p style="
              color: #666;
              margin-top: 10px;
              font-size: 16px;
            ">You have ${words.length} word${words.length > 1 ? 's' : ''} to review today</p>
          </div>

          ${words.map((item, index) => `
            <div style="
              background-color: #f8fafc;
              border-radius: 6px;
              padding: 20px;
              margin-bottom: 15px;
            ">
              <h2 style="
                color: #1e40af;
                margin: 0 0 10px 0;
                font-size: 20px;
                font-weight: 600;
                display: flex;
                align-items: center;
              ">
                <span style="
                  background-color: #2563eb;
                  color: white;
                  width: 24px;
                  height: 24px;
                  border-radius: 12px;
                  display: inline-block;
                  text-align: center;
                  line-height: 24px;
                  font-size: 14px;
                  margin-right: 10px;
                ">${index + 1}</span>
                ${item.word}
              </h2>
              <div style="
                margin-left: 34px;
              ">
                <p style="
                  margin: 0 0 10px 0;
                  color: #333;
                  font-size: 16px;
                ">
                  <strong style="color: #666;">Definition:</strong> ${item.definition}
                </p>
                ${item.context ? `
                  <p style="
                    margin: 0;
                    color: #666;
                    font-size: 15px;
                    font-style: italic;
                  ">
                    <strong style="color: #666;">Context:</strong> ${item.context}
                  </p>
                ` : ''}
              </div>
            </div>
          `).join('')}

          <div style="
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 14px;
          ">
            <p style="margin: 0;">Keep up the great work with your vocabulary learning!</p>
            <p style="
              margin: 10px 0 0 0;
              font-size: 12px;
              color: #999;
            ">
              Sent by Vocab Reminder
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Time to review your words:

    ${words.map((item, index) => `${index + 1}. ${item.word}
     Definition: ${item.definition}${item.context ? `\n   Context: ${item.context}` : ''}`).join('\n\n')}
  `;

  return { subject, html, text };
}
