/**
 * Utility function for creating and opening mailto links
 * This ensures consistent behavior across all devices and browsers
 */

export interface MailtoOptions {
  email: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}

/**
 * Creates a mailto URL with proper encoding
 */
export function createMailtoUrl(options: MailtoOptions): string {
  const { email, subject, body, cc, bcc } = options;
  let url = `mailto:${email}`;
  const params: string[] = [];

  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }
  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }
  if (cc) {
    params.push(`cc=${encodeURIComponent(cc)}`);
  }
  if (bcc) {
    params.push(`bcc=${encodeURIComponent(bcc)}`);
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

/**
 * Opens mailto link in the default email client
 * Uses the most reliable method for cross-platform compatibility
 * This method works on both desktop and mobile devices
 */
export function openMailto(options: MailtoOptions): void {
  const mailtoUrl = createMailtoUrl(options);
  
  // Primary method: window.location.href (most reliable for mailto on all platforms)
  // This works on desktop browsers, mobile browsers, and opens the default email client
  try {
    window.location.href = mailtoUrl;
  } catch (error) {
    // Fallback 1: create and click anchor element (for browsers that block location changes)
    console.warn('Failed to open mailto with window.location, trying fallback:', error);
    try {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.style.display = 'none';
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);
    } catch (fallbackError) {
      // Fallback 2: try window.open as last resort
      console.error('Failed to open mailto link with fallback, trying window.open:', fallbackError);
      try {
        window.open(mailtoUrl, '_self');
      } catch (finalError) {
        console.error('All methods failed to open mailto link:', finalError);
        // Show user-friendly error message
        alert('Unable to open email client. Please contact us at: sukhrobjonrikhsiboev@gmail.com');
      }
    }
  }
}

/**
 * Default email for ZAMINAT.eco
 */
export const DEFAULT_EMAIL = 'sukhrobjonrikhsiboev@gmail.com';

/**
 * Helper function for common contact scenarios
 */
export const contactHelpers = {
  /**
   * General contact inquiry
   */
  generalInquiry: (customSubject?: string, customBody?: string) => {
    openMailto({
      email: DEFAULT_EMAIL,
      subject: customSubject || 'Contact Us - ZAMINAT.eco',
      body: customBody || 'I am interested in learning more about ZAMINAT.eco and would like to get in touch.'
    });
  },

  /**
   * Product inquiry
   */
  productInquiry: (productName: string, language: string = 'en') => {
    const subjects = {
      en: `Contact Us - ${productName}`,
      ru: `Связаться с нами - ${productName}`,
      uz: `Biz bilan bog'lanish - ${productName}`
    };
    
    const bodies = {
      en: `I am interested in this product: ${productName}`,
      ru: `Меня заинтересовал этот товар: ${productName}`,
      uz: `Men bu mahsulot bilan qiziqaman: ${productName}`
    };

    openMailto({
      email: DEFAULT_EMAIL,
      subject: subjects[language as keyof typeof subjects] || subjects.en,
      body: bodies[language as keyof typeof bodies] || bodies.en
    });
  },

  /**
   * Partner offer inquiry
   */
  partnerInquiry: (partnerName: string, language: string = 'en') => {
    const subjects = {
      en: `Partner Offer Inquiry - ${partnerName}`,
      ru: `Запрос о партнерском предложении - ${partnerName}`,
      uz: `Hamkor taklifi so'rovi - ${partnerName}`
    };
    
    const bodies = {
      en: `I am interested in this partner offer: ${partnerName}`,
      ru: `Меня заинтересовало это партнерское предложение: ${partnerName}`,
      uz: `Men bu hamkor taklifi bilan qiziqaman: ${partnerName}`
    };

    openMailto({
      email: DEFAULT_EMAIL,
      subject: subjects[language as keyof typeof subjects] || subjects.en,
      body: bodies[language as keyof typeof bodies] || bodies.en
    });
  },

  /**
   * Team member contact
   */
  teamMemberContact: (memberEmail: string, memberName: string, language: string = 'en') => {
    const subjects = {
      en: `Contact ${memberName} - ZAMINAT.eco`,
      ru: `Связаться с ${memberName} - ZAMINAT.eco`,
      uz: `${memberName} bilan bog'lanish - ZAMINAT.eco`
    };

    openMailto({
      email: memberEmail,
      subject: subjects[language as keyof typeof subjects] || subjects.en,
      body: ''
    });
  },

  /**
   * Join team inquiry
   */
  joinTeam: (language: string = 'en') => {
    const subjects = {
      en: 'Join ZAMINAT.eco Team',
      ru: 'Присоединиться к команде ZAMINAT.eco',
      uz: 'ZAMINAT.eco jamoasiga qo\'shilish'
    };

    const bodies = {
      en: 'I am interested in joining the ZAMINAT.eco team and would like to learn more about available opportunities.',
      ru: 'Меня интересует присоединение к команде ZAMINAT.eco, и я хотел бы узнать больше о доступных возможностях.',
      uz: 'Men ZAMINAT.eco jamoasiga qo\'shilish bilan qiziqaman va mavjud imkoniyatlar haqida ko\'proq ma\'lumot olishni xohlayman.'
    };

    openMailto({
      email: DEFAULT_EMAIL,
      subject: subjects[language as keyof typeof subjects] || subjects.en,
      body: bodies[language as keyof typeof bodies] || bodies.en
    });
  },

  /**
   * Urgent inquiry
   */
  urgentInquiry: (language: string = 'en') => {
    const subjects = {
      en: 'Urgent Inquiry - ZAMINAT.eco',
      ru: 'Срочный запрос - ZAMINAT.eco',
      uz: 'Shoshilinch so\'rov - ZAMINAT.eco'
    };

    openMailto({
      email: DEFAULT_EMAIL,
      subject: subjects[language as keyof typeof subjects] || subjects.en,
      body: ''
    });
  }
};

