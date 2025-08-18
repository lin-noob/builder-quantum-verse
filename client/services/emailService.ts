// 邮件模拟服务
interface EmailTemplate {
  subject: string;
  content: string;
}

interface EmailData {
  to: string;
  template: EmailTemplate;
  verificationCode?: string;
}

class EmailService {
  // 邮件模板
  private templates = {
    register: {
      subject: "完成注册 - 您的确认验证码",
      content: `您好,

我们收到了一个在 AI营销平台 创建账户的请求。

请在我们的网站上输入以下确认码。该验证码将在10分钟后失效。

{VERIFICATION_CODE}

谢谢,
AI营销平台 支持团队`
    },
    
    resetPassword: {
      subject: "重置您的账户密码",
      content: `您好,

{VERIFICATION_CODE} 是用于验证您邮箱地址的代码。该验证码有效期为10分钟。

如果您有任何问题，请联系我们。

谢谢,
AI营销平台 支持团队`
    }
  };

  // 发送注册验证码邮件
  async sendRegistrationEmail(email: string, verificationCode: string): Promise<boolean> {
    const template = this.templates.register;
    const content = template.content.replace("{VERIFICATION_CODE}", verificationCode);
    
    return this.simulateSendEmail({
      to: email,
      template: {
        subject: template.subject,
        content: content
      },
      verificationCode
    });
  }

  // 发送重置密码验证码邮件
  async sendPasswordResetEmail(email: string, verificationCode: string): Promise<boolean> {
    const template = this.templates.resetPassword;
    const content = template.content.replace("{VERIFICATION_CODE}", verificationCode);
    
    return this.simulateSendEmail({
      to: email,
      template: {
        subject: template.subject,
        content: content
      },
      verificationCode
    });
  }

  // 模拟发送邮件
  private async simulateSendEmail(emailData: EmailData): Promise<boolean> {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 在控制台中显示邮件内容（用于开发调试）
        console.log("📧 邮件发送模拟:");
        console.log("收件人:", emailData.to);
        console.log("主题:", emailData.template.subject);
        console.log("内容:", emailData.template.content);
        console.log("验证码:", emailData.verificationCode);
        console.log("------------------------");
        
        // 在实际应用中，这里会调用真正的邮件发送服务
        // 例如：SendGrid, AWS SES, 阿里云邮件推送等
        
        resolve(true);
      }, 500 + Math.random() * 1000); // 0.5-1.5秒的随机延迟
    });
  }

  // 验证邮箱格式
  validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 生成验证码
  generateVerificationCode(length: number = 6): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 生成字母数字混合验证码
  generateAlphanumericCode(length: number = 6): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// 导出单例实例
export const emailService = new EmailService();
export type { EmailTemplate, EmailData };
