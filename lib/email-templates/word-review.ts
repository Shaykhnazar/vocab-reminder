// lib/email-templates/word-review.ts
import { getBaseEmailTemplate } from './base-template';

interface WordToReview {
  word: string;
  definition: string;
  context?: string | null;
}

export function getWordReviewTemplate(words: WordToReview[]) {
  const content = `
    <p style="
      color: #666;
      margin-top: 10px;
      font-size: 16px;
      text-align: center;
    ">You have ${words.length} word${words.length > 1 ? 's' : ''} to review today</p>

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

    <p style="
      text-align: center;
      color: #666;
      margin-top: 25px;
      font-size: 16px;
    ">
      Keep up the great work with your vocabulary learning!
    </p>
  `;

  return {
    subject: `Word Review Reminder - ${words.length} words to review`,
    html: getBaseEmailTemplate({
      title: "Time to Review Your Words",
      preheader: `You have ${words.length} word${words.length > 1 ? 's' : ''} to review`,
      content,
    }),
    text: `
      Time to review your words:

      ${words.map((item, index) => `${index + 1}. ${item.word}
       Definition: ${item.definition}${item.context ? `\n   Context: ${item.context}` : ''}`).join('\n\n')}
    `,
  };
}
