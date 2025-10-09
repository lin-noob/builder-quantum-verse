import { TicketEvaluation, TicketMessage, Ticket } from '@/shared/ticketData';

export interface EvaluationCriteria {
  responseTime: number;      // 响应时间评分 (0-100)
  communicationQuality: number; // 沟通质量评分 (0-100)
  problemResolution: number;    // 问题解决评分 (0-100)
  customerSatisfaction: number; // 客户满意度评分 (0-100)
}

export interface EvaluationResult {
  score: number;
  summary: string;
  details: Array<{
    type: 'positive' | 'negative' | 'neutral';
    content: string;
  }>;
  criteria: EvaluationCriteria;
}

export class TicketEvaluationService {
  /**
   * 自动评估Ticket会话
   */
  static async evaluateTicket(ticket: Ticket): Promise<EvaluationResult> {
    const messages = ticket.messages;
    const criteria = this.calculateCriteria(ticket, messages);
    const overallScore = this.calculateOverallScore(criteria);
    
    return {
      score: overallScore,
      summary: this.generateSummary(ticket, criteria),
      details: this.generateDetails(ticket, criteria),
      criteria
    };
  }

  /**
   * 计算各项评估标准的分数
   */
  private static calculateCriteria(ticket: Ticket, messages: TicketMessage[]): EvaluationCriteria {
    return {
      responseTime: this.evaluateResponseTime(messages),
      communicationQuality: this.evaluateCommunicationQuality(messages),
      problemResolution: this.evaluateProblemResolution(ticket, messages),
      customerSatisfaction: this.evaluateCustomerSatisfaction(ticket, messages)
    };
  }

  /**
   * 评估响应时间
   */
  private static evaluateResponseTime(messages: TicketMessage[]): number {
    if (messages.length < 2) return 50;

    const agentMessages = messages.filter(m => m.sender === 'agent');
    const customerMessages = messages.filter(m => m.sender === 'customer');
    
    if (agentMessages.length === 0) return 0;

    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 0; i < customerMessages.length; i++) {
      const customerMsg = customerMessages[i];
      const nextAgentMsg = agentMessages.find(
        am => new Date(am.timestamp) > new Date(customerMsg.timestamp)
      );

      if (nextAgentMsg) {
        const responseTime = new Date(nextAgentMsg.timestamp).getTime() - 
                           new Date(customerMsg.timestamp).getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    }

    if (responseCount === 0) return 50;

    const avgResponseTime = totalResponseTime / responseCount;
    const hours = avgResponseTime / (1000 * 60 * 60);

    // 评分逻辑：1小时内100分，24小时内80分，48小时内60分，超过48小时40分
    if (hours <= 1) return 100;
    if (hours <= 24) return 80;
    if (hours <= 48) return 60;
    return 40;
  }

  /**
   * 评估沟通质量
   */
  private static evaluateCommunicationQuality(messages: TicketMessage[]): number {
    const agentMessages = messages.filter(m => m.sender === 'agent');
    
    if (agentMessages.length === 0) return 0;

    let score = 70; // 基础分

    // 检查消息长度和详细程度
    const avgMessageLength = agentMessages.reduce((sum, msg) => sum + msg.content.length, 0) / agentMessages.length;
    if (avgMessageLength > 100) score += 10;
    if (avgMessageLength > 200) score += 10;

    // 检查是否有礼貌用语
    const politeWords = ['请', '谢谢', '感谢', '抱歉', '对不起', '很高兴', '帮助'];
    const hasPoliteWords = agentMessages.some(msg => 
      politeWords.some(word => msg.content.includes(word))
    );
    if (hasPoliteWords) score += 10;

    // 检查是否提供了具体解决方案
    const solutionWords = ['解决', '方案', '建议', '步骤', '操作', '设置'];
    const hasSolutions = agentMessages.some(msg => 
      solutionWords.some(word => msg.content.includes(word))
    );
    if (hasSolutions) score += 10;

    return Math.min(100, score);
  }

  /**
   * 评估问题解决情况
   */
  private static evaluateProblemResolution(ticket: Ticket, messages: TicketMessage[]): number {
    let score = 50; // 基础分

    // 根据Ticket状态评分
    switch (ticket.status) {
      case 'RESOLVED':
        score = 90;
        break;
      case 'CLOSED':
        score = 95;
        break;
      case 'IN_PROGRESS':
        score = 70;
        break;
      case 'PENDING_CUSTOMER':
        score = 75;
        break;
      case 'OPEN':
        score = 40;
        break;
    }

    // 检查是否有跟进消息
    const agentMessages = messages.filter(m => m.sender === 'agent');
    if (agentMessages.length > 2) score += 5;

    // 检查最后一条消息是否是客服回复
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'agent') score += 5;

    return Math.min(100, score);
  }

  /**
   * 评估客户满意度
   */
  private static evaluateCustomerSatisfaction(ticket: Ticket, messages: TicketMessage[]): number {
    let score = 70; // 基础分

    const customerMessages = messages.filter(m => m.sender === 'customer');
    
    // 检查客户反馈中的积极词汇
    const positiveWords = ['谢谢', '感谢', '满意', '很好', '解决了', '有帮助'];
    const negativeWords = ['不满意', '没用', '糟糕', '失望', '投诉'];

    const hasPositiveFeedback = customerMessages.some(msg => 
      positiveWords.some(word => msg.content.includes(word))
    );
    const hasNegativeFeedback = customerMessages.some(msg => 
      negativeWords.some(word => msg.content.includes(word))
    );

    if (hasPositiveFeedback) score += 20;
    if (hasNegativeFeedback) score -= 20;

    // 根据优先级调整分数
    switch (ticket.priority) {
      case 'URGENT':
        score -= 5; // 紧急问题要求更高
        break;
      case 'HIGH':
        score -= 2;
        break;
      case 'LOW':
        score += 5; // 低优先级问题容易满足
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算总体评分
   */
  private static calculateOverallScore(criteria: EvaluationCriteria): number {
    const weights = {
      responseTime: 0.25,
      communicationQuality: 0.25,
      problemResolution: 0.3,
      customerSatisfaction: 0.2
    };

    return Math.round(
      criteria.responseTime * weights.responseTime +
      criteria.communicationQuality * weights.communicationQuality +
      criteria.problemResolution * weights.problemResolution +
      criteria.customerSatisfaction * weights.customerSatisfaction
    );
  }

  /**
   * 生成评估摘要
   */
  private static generateSummary(ticket: Ticket, criteria: EvaluationCriteria): string {
    const score = this.calculateOverallScore(criteria);
    
    if (score >= 90) {
      return `该Ticket处理表现优秀，客服响应及时，沟通专业，问题得到有效解决，客户满意度高。`;
    } else if (score >= 80) {
      return `该Ticket处理表现良好，整体服务质量较高，有少许可以改进的地方。`;
    } else if (score >= 70) {
      return `该Ticket处理表现一般，基本满足客户需求，但在响应时间或沟通质量方面有待提升。`;
    } else if (score >= 60) {
      return `该Ticket处理存在一些问题，需要在服务质量和问题解决效率方面进行改进。`;
    } else {
      return `该Ticket处理表现不佳，存在较多问题，需要重点关注和改进服务流程。`;
    }
  }

  /**
   * 生成详细评估内容
   */
  private static generateDetails(ticket: Ticket, criteria: EvaluationCriteria): Array<{
    type: 'positive' | 'negative' | 'neutral';
    content: string;
  }> {
    const details = [];

    // 响应时间评估
    if (criteria.responseTime >= 80) {
      details.push({
        type: 'positive' as const,
        content: `响应时间表现优秀 (${criteria.responseTime}分)，能够及时回复客户咨询`
      });
    } else if (criteria.responseTime < 60) {
      details.push({
        type: 'negative' as const,
        content: `响应时间需要改进 (${criteria.responseTime}分)，建议提高回复效率`
      });
    }

    // 沟通质量评估
    if (criteria.communicationQuality >= 80) {
      details.push({
        type: 'positive' as const,
        content: `沟通质量良好 (${criteria.communicationQuality}分)，表达清晰专业`
      });
    } else if (criteria.communicationQuality < 60) {
      details.push({
        type: 'negative' as const,
        content: `沟通质量有待提升 (${criteria.communicationQuality}分)，建议提供更详细的解决方案`
      });
    }

    // 问题解决评估
    if (criteria.problemResolution >= 80) {
      details.push({
        type: 'positive' as const,
        content: `问题解决效果好 (${criteria.problemResolution}分)，能够有效处理客户问题`
      });
    } else if (criteria.problemResolution < 60) {
      details.push({
        type: 'negative' as const,
        content: `问题解决效果不佳 (${criteria.problemResolution}分)，需要加强问题分析和解决能力`
      });
    }

    // 客户满意度评估
    if (criteria.customerSatisfaction >= 80) {
      details.push({
        type: 'positive' as const,
        content: `客户满意度高 (${criteria.customerSatisfaction}分)，获得客户认可`
      });
    } else if (criteria.customerSatisfaction < 60) {
      details.push({
        type: 'negative' as const,
        content: `客户满意度偏低 (${criteria.customerSatisfaction}分)，需要关注客户体验`
      });
    }

    // 添加一些通用建议
    if (ticket.status === 'CLOSED') {
      details.push({
        type: 'neutral' as const,
        content: 'Ticket已关闭，建议定期回访确保问题彻底解决'
      });
    }

    if (ticket.priority === 'URGENT' && criteria.responseTime < 80) {
      details.push({
        type: 'negative' as const,
        content: '紧急问题的响应时间需要进一步优化'
      });
    }

    return details;
  }

  /**
   * 创建评估记录
   */
  static createEvaluationRecord(
    ticketId: string, 
    evaluationResult: EvaluationResult
  ): TicketEvaluation {
    return {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      score: evaluationResult.score,
      summary: evaluationResult.summary,
      details: evaluationResult.details,
      evaluatedAt: new Date().toISOString(),
      criteria: evaluationResult.criteria
    };
  }

  /**
   * 批量评估多个Tickets
   */
  static async batchEvaluateTickets(tickets: Ticket[]): Promise<TicketEvaluation[]> {
    const evaluations: TicketEvaluation[] = [];
    
    for (const ticket of tickets) {
      try {
        const result = await this.evaluateTicket(ticket);
        const evaluation = this.createEvaluationRecord(ticket.id, result);
        evaluations.push(evaluation);
      } catch (error) {
        console.error(`Failed to evaluate ticket ${ticket.id}:`, error);
      }
    }
    
    return evaluations;
  }

  /**
   * 获取评估统计信息
   */
  static getEvaluationStats(evaluations: TicketEvaluation[]) {
    if (evaluations.length === 0) {
      return {
        averageScore: 0,
        totalEvaluations: 0,
        scoreDistribution: {
          excellent: 0, // 90-100
          good: 0,      // 80-89
          average: 0,   // 70-79
          poor: 0       // <70
        }
      };
    }

    const totalScore = evaluations.reduce((sum, eval) => sum + eval.score, 0);
    const averageScore = Math.round(totalScore / evaluations.length);

    const scoreDistribution = evaluations.reduce((dist, eval) => {
      if (eval.score >= 90) dist.excellent++;
      else if (eval.score >= 80) dist.good++;
      else if (eval.score >= 70) dist.average++;
      else dist.poor++;
      return dist;
    }, { excellent: 0, good: 0, average: 0, poor: 0 });

    return {
      averageScore,
      totalEvaluations: evaluations.length,
      scoreDistribution
    };
  }
}